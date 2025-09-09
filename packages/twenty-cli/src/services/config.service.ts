import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { TwentyConfig } from '../types/config.types';

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.twenty', 'config.json');
  }

  async getConfig(): Promise<TwentyConfig> {
    try {
      await fs.ensureFile(this.configPath);
      const configExists = await fs.pathExists(this.configPath);

      if (!configExists) {
        return this.getDefaultConfig();
      }

      const configContent = await fs.readFile(this.configPath, 'utf8');
      const config = JSON.parse(configContent || '{}');

      return {
        ...this.getDefaultConfig(),
        ...config,
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
      apiUrl: process.env.TWENTY_API_URL || 'http://localhost:3000',
    };
  }
}
