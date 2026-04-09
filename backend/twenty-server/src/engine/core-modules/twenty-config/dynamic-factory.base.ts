import { createHash } from 'crypto';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';
import { type ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { TypedReflect } from 'src/utils/typed-reflect';

export abstract class DriverFactoryBase<TDriver> {
  private currentDriver: TDriver | null = null;
  private currentConfigKey: string | null = null;

  constructor(protected readonly twentyConfigService: TwentyConfigService) {}

  getCurrentDriver(): TDriver {
    let configKey: string;

    try {
      configKey = this.buildConfigKey();
    } catch (error) {
      throw new Error(
        `Failed to build config key for ${this.constructor.name}. Original error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (this.currentConfigKey !== configKey) {
      try {
        this.currentDriver = this.createDriver();
      } catch (error) {
        throw new Error(
          `Failed to create driver for ${this.constructor.name} with config key: ${configKey}. Original error: ${error instanceof Error ? error.message : String(error)}`,
        );
      }

      this.currentConfigKey = configKey;
    }

    if (!this.currentDriver) {
      throw new Error(
        `Failed to create driver for ${this.constructor.name} with config key: ${configKey}`,
      );
    }

    return this.currentDriver;
  }

  protected getConfigGroupHash(group: ConfigVariablesGroup): string {
    const groupVariables = this.getConfigVariablesByGroup(group);

    const configValues = groupVariables
      .map((key) => `${key}=${this.twentyConfigService.get(key)}`)
      .sort()
      .join('|');

    return createHash('sha256')
      .update(configValues)
      .digest('hex')
      .substring(0, 16);
  }

  private getConfigVariablesByGroup(
    group: ConfigVariablesGroup,
  ): Array<keyof ConfigVariables> {
    const metadata =
      TypedReflect.getMetadata('config-variables', ConfigVariables) ?? {};

    return Object.keys(metadata)
      .filter((key) => metadata[key]?.group === group)
      .map((key) => key as keyof ConfigVariables);
  }

  protected abstract buildConfigKey(): string;
  protected abstract createDriver(): TDriver;
}
