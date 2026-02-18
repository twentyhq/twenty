import { type ClientService } from '@/cli/utilities/client/client-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export type ApiClientGeneratedFile = {
  fileFolder: FileFolder;
  builtPath: string;
  sourcePath: string;
  checksum: string;
};

const API_CLIENT_FILES = ['types.ts', 'schema.ts'];

export class GenerateApiClientOrchestratorStep {
  private clientService: ClientService;
  private configService: ConfigService;
  private state: OrchestratorState;
  private notify: () => void;
  private onApiClientGenerated: (files: ApiClientGeneratedFile[]) => void;

  constructor({
    clientService,
    configService,
    state,
    notify,
    onApiClientGenerated,
  }: {
    clientService: ClientService;
    configService: ConfigService;
    state: OrchestratorState;
    notify: () => void;
    onApiClientGenerated: (files: ApiClientGeneratedFile[]) => void;
  }) {
    this.clientService = clientService;
    this.configService = configService;
    this.state = state;
    this.notify = notify;
    this.onApiClientGenerated = onApiClientGenerated;
  }

  async execute(input: { appPath: string }): Promise<void> {
    const step = this.state.steps.generateApiClient;

    step.status = 'in_progress';
    this.notify();

    try {
      const config = await this.configService.getConfig();

      await this.clientService.generate({
        appPath: input.appPath,
        authToken: config.applicationAccessToken,
      });

      const files = await this.copyApiClientFiles(input.appPath);

      this.registerBuiltFiles(files);
      this.onApiClientGenerated(files);

      step.status = 'done';
    } catch (error) {
      this.state.applyStepEvents([
        {
          message: `Failed to generate API client: ${error instanceof Error ? error.message : String(error)}`,
          status: 'error',
        },
      ]);
      step.status = 'error';
    }

    this.notify();
  }

  private registerBuiltFiles(files: ApiClientGeneratedFile[]): void {
    for (const file of files) {
      this.state.steps.uploadFiles.output.builtFileInfos.set(file.builtPath, {
        checksum: file.checksum,
        builtPath: file.builtPath,
        sourcePath: file.sourcePath,
        fileFolder: file.fileFolder,
      });
    }
  }

  private async copyApiClientFiles(
    appPath: string,
  ): Promise<ApiClientGeneratedFile[]> {
    const generatedDir = join(
      appPath,
      'node_modules',
      'twenty-sdk',
      'generated',
    );
    const outputDir = join(appPath, OUTPUT_DIR, 'api-client');

    await fs.ensureDir(outputDir);

    const files: ApiClientGeneratedFile[] = [];

    for (const fileName of API_CLIENT_FILES) {
      const absoluteSourcePath = join(generatedDir, fileName);

      if (!(await fs.pathExists(absoluteSourcePath))) {
        continue;
      }

      await fs.copy(absoluteSourcePath, join(outputDir, fileName));

      const content = await fs.readFile(absoluteSourcePath);
      const checksum = crypto
        .createHash('md5')
        .update(content)
        .digest('hex');

      files.push({
        fileFolder: FileFolder.Dependencies,
        builtPath: join(OUTPUT_DIR, 'api-client', fileName),
        sourcePath: join('api-client', fileName),
        checksum,
      });
    }

    return files;
  }
}
