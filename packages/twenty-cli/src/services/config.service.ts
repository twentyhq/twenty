import { config as loadDotenv } from 'dotenv';
import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';
import { TwentyConfig } from '../types/config.types';

export class ConfigService {
  private configPath: string;

  constructor() {
    this.configPath = path.join(os.homedir(), '.twenty', 'config.json');
    this.loadEnvironmentVariables();
  }

  private loadEnvironmentVariables(): void {
    // Load local .env file if it exists in current working directory
    const localEnvPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(localEnvPath)) {
      loadDotenv({ path: localEnvPath });
    }

    // Also try to load from user's home .twenty directory
    const userEnvPath = path.join(os.homedir(), '.twenty', '.env');
    if (fs.existsSync(userEnvPath)) {
      loadDotenv({ path: userEnvPath });
    }
  }

  async getConfig(): Promise<TwentyConfig> {
    try {
      // Start with default config
      const defaultConfig = this.getDefaultConfig();

      // Load config file if it exists
      let fileConfig = {};
      await fs.ensureFile(this.configPath);
      const configExists = await fs.pathExists(this.configPath);

      if (configExists) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        fileConfig = JSON.parse(configContent || '{}');
      }

      // Environment variables override everything
      const envConfig = this.getEnvironmentConfig();

      // Merge configs with proper precedence: defaults < file < environment
      return {
        ...defaultConfig,
        ...fileConfig,
        ...envConfig,
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

  private getEnvironmentConfig(): Partial<TwentyConfig> {
    const envConfig: Partial<TwentyConfig> = {};

    if (process.env.TWENTY_API_URL) {
      envConfig.apiUrl = process.env.TWENTY_API_URL;
    }

    if (process.env.TWENTY_API_KEY) {
      envConfig.apiKey = process.env.TWENTY_API_KEY;
    }

    if (process.env.TWENTY_DEFAULT_APP) {
      envConfig.defaultApp = process.env.TWENTY_DEFAULT_APP;
    }

    return envConfig;
  }
}
