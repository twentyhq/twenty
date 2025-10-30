import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { TwentyConfig } from '../types/config.types';

export class ConfigService {
  private readonly configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.twenty', 'config.json');
  }

  async getConfig(): Promise<TwentyConfig> {
    try {
      const defaultConfig = this.getDefaultConfig();

      let fileConfig = {};
      await fs.ensureFile(this.configPath);
      const configExists = await fs.pathExists(this.configPath);

      if (configExists) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        // TODO parse using a zod schema
        fileConfig = JSON.parse(configContent || '{}');
      }

      return {
        ...defaultConfig,
        ...fileConfig,
      };
    } catch {
      return this.getDefaultConfig();
    }
  }

  async setConfig(config: Partial<TwentyConfig>): Promise<void> {
    const currentConfig = await this.getConfig();
    const newConfig = { ...currentConfig, ...config };

    await fs.ensureDir(path.dirname(this.configPath));
    await fs.writeFile(this.configPath, JSON.stringify(newConfig, null, 2));
  }

  async clearConfig(): Promise<void> {
    const configExists = await fs.pathExists(this.configPath);
    if (configExists) {
      await fs.remove(this.configPath);
    }
  }

  private getDefaultConfig(): TwentyConfig {
    return {
      apiUrl: 'http://localhost:3000',
    };
  }
}
