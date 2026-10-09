import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';

import type {
  CheckoutOptions,
  Monty,
  MontySession,
  PrintCallback,
} from '@pydantic/monty';
import { isDefined } from 'twenty-shared/utils';

import { MONTY_POOL_OPTIONS } from 'src/engine/core-modules/code-mode/constants/monty-pool-options.constant';
import { formatMontyError } from 'src/engine/core-modules/code-mode/utils/format-monty-error.util';
import {
  loadMontyModule,
  type MontyModule,
} from 'src/engine/core-modules/code-mode/utils/load-monty-module.util';

export type MontyScriptRunResult =
  | { success: true; value: unknown }
  | { success: false; error: string };

@Injectable()
export class MontyPoolService implements OnModuleDestroy {
  private readonly logger = new Logger(MontyPoolService.name);
  private montyModulePromise: Promise<MontyModule> | undefined;
  private poolPromise: Promise<Monty> | undefined;

  async runScript({
    code,
    checkoutOptions,
    externalFunctions,
    onPrint,
  }: {
    code: string;
    checkoutOptions: CheckoutOptions;
    externalFunctions: Record<string, unknown>;
    onPrint: PrintCallback;
  }): Promise<MontyScriptRunResult> {
    let montyModule: MontyModule;
    let session: MontySession;

    try {
      montyModule = await this.getMontyModule();

      const pool = await this.getPool(montyModule);

      session = await pool.checkout(checkoutOptions);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      this.logger.error(`Monty sandbox unavailable: ${message}`);

      return {
        success: false,
        error: `The script sandbox is unavailable: ${message}`,
      };
    }

    try {
      const value = await session.feedRun(code, {
        externalLookup: externalFunctions,
        printCallback: onPrint,
      });

      return { success: true, value };
    } catch (error) {
      return { success: false, error: formatMontyError(error, montyModule) };
    } finally {
      await session.close().catch((error: unknown) => {
        this.logger.warn(
          `Failed to release Monty session: ${error instanceof Error ? error.message : String(error)}`,
        );
      });
    }
  }

  async onModuleDestroy(): Promise<void> {
    const poolPromise = this.poolPromise;

    this.poolPromise = undefined;

    if (!isDefined(poolPromise)) {
      return;
    }

    const pool = await poolPromise.catch(() => undefined);

    await pool?.close();
  }

  private getMontyModule(): Promise<MontyModule> {
    if (!isDefined(this.montyModulePromise)) {
      this.montyModulePromise = loadMontyModule().catch((error: unknown) => {
        this.montyModulePromise = undefined;
        throw error;
      });
    }

    return this.montyModulePromise;
  }

  private getPool(montyModule: MontyModule): Promise<Monty> {
    if (!isDefined(this.poolPromise)) {
      this.poolPromise = montyModule.Monty.create(MONTY_POOL_OPTIONS).catch(
        (error: unknown) => {
          this.poolPromise = undefined;
          throw error;
        },
      );
    }

    return this.poolPromise;
  }
}
