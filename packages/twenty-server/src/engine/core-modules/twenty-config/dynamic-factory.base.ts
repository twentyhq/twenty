import { type ConfigGroupHashService } from 'src/engine/core-modules/twenty-config/services/config-group-hash.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

export abstract class DriverFactoryBase<TDriver> {
  private currentDriver: TDriver | null = null;
  private currentConfigKey: string | null = null;

  constructor(
    protected readonly twentyConfigService: TwentyConfigService,
    protected readonly configGroupHashService: ConfigGroupHashService,
  ) {}

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

  protected abstract buildConfigKey(): string;
  protected abstract createDriver(): TDriver;
}
