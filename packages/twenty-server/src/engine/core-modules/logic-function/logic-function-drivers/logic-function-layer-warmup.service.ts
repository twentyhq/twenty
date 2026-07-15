import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { basename } from 'path';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { LocalDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local.driver';
import { LogicFunctionDriverType } from 'src/engine/core-modules/logic-function/logic-function-drivers/interfaces/logic-function-driver.interface';
import { LogicFunctionDriverFactory } from 'src/engine/core-modules/logic-function/logic-function-drivers/logic-function-driver.factory';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { LogicFunctionEntity } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

// Builds the local logic-function layers (deps + SDK) once at boot, before
// any execution needs them. The layer cache lives on the container's
// ephemeral disk, so every deploy starts cold: without a warmup the first
// executions all pay the full build simultaneously and can stampede the
// build lock and saturate the S3 connection pool.
@Injectable()
export class LogicFunctionLayerWarmupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(LogicFunctionLayerWarmupService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly logicFunctionDriverFactory: LogicFunctionDriverFactory,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
    @InjectRepository(LogicFunctionEntity)
    private readonly logicFunctionRepository: Repository<LogicFunctionEntity>,
  ) {}

  onApplicationBootstrap(): void {
    const driverType = this.twentyConfigService.get('LOGIC_FUNCTION_TYPE');

    if (driverType !== LogicFunctionDriverType.LOCAL) {
      return;
    }

    // Command entrypoints (migrations, upgrades, cache flushes) load the same
    // global module graph but are short-lived: a warmup racing their shutdown
    // fails on closed Redis/DB clients and can die holding the layer build
    // lock, blocking real servers for the whole lock TTL. Only long-lived
    // processes (API server main.ts, queue-worker.ts) should warm up.
    // Extensionless match: the prod entrypoint runs `node dist/command/command`.
    const entryScript = basename(process.argv[1] ?? '');

    if (/^command(\.(js|ts|mjs|cjs))?$/.test(entryScript)) {
      return;
    }

    // Fire-and-forget: warming up must never block or fail boot.
    void this.warmUpAllLayers().catch((error) => {
      this.logger.error(`Logic function layer warmup failed: ${error.message}`);
      this.exceptionHandlerService.captureExceptions([error]);
    });
  }

  private async warmUpAllLayers(): Promise<void> {
    const driver = this.logicFunctionDriverFactory.getCurrentDriver();

    if (!(driver instanceof LocalDriver)) {
      return;
    }

    const startedAt = Date.now();

    const targets: Array<{
      workspaceId: string;
      applicationId: string | null;
    }> = await this.logicFunctionRepository
      .createQueryBuilder('logicFunction')
      .select('"logicFunction"."workspaceId"', 'workspaceId')
      .addSelect('"logicFunction"."applicationId"', 'applicationId')
      .distinct(true)
      .getRawMany();

    let warmedUpCount = 0;

    // Sequential on purpose: one build at a time keeps S3 and CPU pressure flat.
    for (const { workspaceId, applicationId } of targets) {
      if (!isDefined(applicationId)) {
        continue;
      }

      try {
        const { flatApplicationMaps } =
          await this.workspaceCacheService.getOrRecompute(workspaceId, [
            'flatApplicationMaps',
          ]);
        const flatApplication = flatApplicationMaps.byId[applicationId];

        if (!isDefined(flatApplication)) {
          continue;
        }

        await driver.warmUpLayers({
          flatApplication,
          applicationUniversalIdentifier: flatApplication.universalIdentifier,
        });
        warmedUpCount++;
      } catch (error) {
        // Log-and-continue only: layer build/lock failures are already
        // captured by LocalLayerManagerService, so capturing here again
        // would double-count the same incident.
        this.logger.error(
          `Layer warmup failed for application ${applicationId} in workspace ${workspaceId}: ${error.message}`,
        );
      }
    }

    this.logger.log(
      `Logic function layer warmup completed for ${warmedUpCount}/${targets.length} application(s) in ${Date.now() - startedAt}ms`,
    );
  }
}
