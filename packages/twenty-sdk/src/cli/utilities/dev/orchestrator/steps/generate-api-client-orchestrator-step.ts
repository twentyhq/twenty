import { type ClientService } from '@/cli/utilities/client/client-service';
import { type ConfigService } from '@/cli/utilities/config/config-service';
import { type OrchestratorState } from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { type UploadFilesOrchestratorStep } from '@/cli/utilities/dev/orchestrator/steps/upload-files-orchestrator-step';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

const API_CLIENT_FILES = ['types.ts', 'schema.ts'];

export class GenerateApiClientOrchestratorStep {
  private clientService: ClientService;
  private configService: ConfigService;
  private state: OrchestratorState;
  private notify: () => void;
  private uploadFilesStep: UploadFilesOrchestratorStep;

  constructor({
    clientService,
    configService,
    state,
    notify,
    uploadFilesStep,
  }: {
    clientService: ClientService;
    configService: ConfigService;
    state: OrchestratorState;
    notify: () => void;
    uploadFilesStep: UploadFilesOrchestratorStep;
  }) {
    this.clientService = clientService;
    this.configService = configService;
    this.state = state;
    this.notify = notify;
    this.uploadFilesStep = uploadFilesStep;
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

      await this.copyAndUploadApiClientFiles(input.appPath);

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

  private async copyAndUploadApiClientFiles(
    appPath: string,
  ): Promise<void> {
    const generatedDir = join(
      appPath,
      'node_modules',
      'twenty-sdk',
      'generated',
    );
    const outputDir = join(appPath, OUTPUT_DIR, 'api-client');

    await fs.ensureDir(outputDir);

    for (const fileName of API_CLIENT_FILES) {
      const sourcePath = join(generatedDir, fileName);

      if (!(await fs.pathExists(sourcePath))) {
        continue;
      }

      const destPath = join(outputDir, fileName);

      await fs.copy(sourcePath, destPath);

      const content = await fs.readFile(destPath);
      const checksum = crypto
        .createHash('md5')
        .update(content)
        .digest('hex');

      const builtPath = join(OUTPUT_DIR, 'api-client', fileName);

      this.state.steps.uploadFiles.output.builtFileInfos.set(builtPath, {
        checksum,
        builtPath,
        sourcePath: join('api-client', fileName),
        fileFolder: FileFolder.Dependencies,
      });

      this.uploadFilesStep.uploadFile(
        builtPath,
        join('api-client', fileName),
        FileFolder.Dependencies,
      );
    }
  }
}
