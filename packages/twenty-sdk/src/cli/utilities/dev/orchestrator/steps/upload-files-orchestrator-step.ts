import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import crypto from 'crypto';
import * as fs from 'fs-extra';
import { join } from 'path';
import { OUTPUT_DIR } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

const API_CLIENT_FILES = ['types.ts', 'schema.ts'];

export type UploadFilesOrchestratorStepOutput = {
  fileUploader: FileUploader | null;
  builtFileInfos: Map<string, OrchestratorStateBuiltFileInfo>;
  activeUploads: Set<Promise<void>>;
};

export class UploadFilesOrchestratorStep {
  private state: OrchestratorState;
  private notify: () => void;

  constructor({
    state,
    notify,
  }: {
    state: OrchestratorState;
    notify: () => void;
  }) {
    this.state = state;
    this.notify = notify;
  }

  get isInitialized(): boolean {
    return this.state.steps.uploadFiles.output.fileUploader !== null;
  }

  initialize(input: { appPath: string; universalIdentifier: string }): void {
    const step = this.state.steps.uploadFiles;

    step.output = {
      ...step.output,
      fileUploader: new FileUploader({
        appPath: input.appPath,
        applicationUniversalIdentifier: input.universalIdentifier,
      }),
    };
    step.status = 'in_progress';
    this.notify();

    this.uploadPendingFiles();
  }

  uploadFile(
    builtPath: string,
    sourcePath: string,
    fileFolder: FileFolder,
  ): void {
    const step = this.state.steps.uploadFiles;

    if (!step.output.fileUploader) {
      return;
    }

    this.state.addEvent({
      message: `Uploading ${builtPath}`,
      status: 'info',
    });
    this.state.updateEntityStatus(sourcePath, 'uploading');

    const uploadPromise = step.output.fileUploader
      .uploadFile({ builtPath, fileFolder })
      .then((result) => {
        if (result.success) {
          this.state.addEvent({
            message: `Successfully uploaded ${builtPath}`,
            status: 'success',
          });
          this.state.updateEntityStatus(sourcePath, 'success');
        } else {
          this.state.addEvent({
            message: `Failed to upload ${builtPath}: ${result.error}`,
            status: 'error',
          });
        }
      })
      .catch((error) => {
        this.state.addEvent({
          message: `Upload failed for ${builtPath}: ${error}`,
          status: 'error',
        });
      })
      .finally(() => {
        step.output.activeUploads.delete(uploadPromise);
      });

    step.output.activeUploads.add(uploadPromise);
  }

  async waitForUploads(): Promise<void> {
    const step = this.state.steps.uploadFiles;

    while (step.output.activeUploads.size > 0) {
      await Promise.all(step.output.activeUploads);
    }

    step.status = 'done';
    this.notify();
  }

  async copyAndUploadApiClientFiles(appPath: string): Promise<void> {
    const generatedDir = join(
      appPath,
      'node_modules',
      'twenty-sdk',
      'generated',
    );

    if (!(await fs.pathExists(generatedDir))) {
      return;
    }

    const outputDir = join(appPath, OUTPUT_DIR, 'api-client');

    await fs.ensureDir(outputDir);

    for (const fileName of API_CLIENT_FILES) {
      const absoluteSourcePath = join(generatedDir, fileName);

      if (!(await fs.pathExists(absoluteSourcePath))) {
        continue;
      }

      await fs.copy(absoluteSourcePath, join(outputDir, fileName));

      const content = await fs.readFile(absoluteSourcePath);
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      const builtPath = join(OUTPUT_DIR, 'api-client', fileName);
      const sourcePath = join('api-client', fileName);

      this.state.steps.uploadFiles.output.builtFileInfos.set(builtPath, {
        checksum,
        builtPath,
        sourcePath,
        fileFolder: FileFolder.Dependencies,
      });

      this.uploadFile(builtPath, sourcePath, FileFolder.Dependencies);
    }
  }

  private uploadPendingFiles(): void {
    for (const [
      builtPath,
      { fileFolder, sourcePath },
    ] of this.state.steps.uploadFiles.output.builtFileInfos.entries()) {
      this.uploadFile(builtPath, sourcePath, fileFolder);
    }
  }
}
