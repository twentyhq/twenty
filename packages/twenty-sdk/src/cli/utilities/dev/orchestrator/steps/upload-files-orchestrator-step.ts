import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type FileFolder } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type UploadFilesOrchestratorStepOutput = {
  fileUploader: FileUploader | null;
  builtFileInfos: Map<string, OrchestratorStateBuiltFileInfo>;
  activeUploads: Set<Promise<void>>;
};

type QueuedUpload = {
  builtPath: string;
  sourcePath: string;
  fileFolder: FileFolder;
};

export class UploadFilesOrchestratorStep {
  private state: OrchestratorState;
  private notify: () => void;
  private verbose: boolean;
  private uploadedCount = 0;
  private failedCount = 0;
  private totalQueued = 0;

  constructor({
    state,
    notify,
    verbose,
  }: {
    state: OrchestratorState;
    notify: () => void;
    verbose?: boolean;
  }) {
    this.state = state;
    this.notify = notify;
    this.verbose = verbose ?? false;
  }

  get isInitialized(): boolean {
    return isDefined(this.state.steps.uploadFiles.output.fileUploader);
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
    this.queueUploads([{ builtPath, sourcePath, fileFolder }]);
  }

  async waitForUploads(): Promise<void> {
    const step = this.state.steps.uploadFiles;

    while (step.output.activeUploads.size > 0) {
      await Promise.all(step.output.activeUploads);
    }

    step.status = 'done';
    this.notify();
  }

  private logUploadSummary(): void {
    if (this.totalQueued === 0) {
      this.resetCounters();

      return;
    }

    if (this.failedCount > 0) {
      this.state.addEvent({
        message: `Uploaded ${this.uploadedCount}/${this.totalQueued} files (${this.failedCount} failed)`,
        status: 'error',
      });
    }

    this.state.addEvent({
      message: `Successfully uploaded ${this.uploadedCount} file${this.uploadedCount !== 1 ? 's' : ''}`,
      status: 'success',
    });

    this.resetCounters();
  }

  private resetCounters(): void {
    this.uploadedCount = 0;
    this.failedCount = 0;
    this.totalQueued = 0;
  }

  private uploadPendingFiles(): void {
    this.queueUploads(
      Array.from(
        this.state.steps.uploadFiles.output.builtFileInfos.entries(),
      ).map(([builtPath, { fileFolder, sourcePath }]) => ({
        builtPath,
        sourcePath,
        fileFolder,
      })),
    );
  }

  private queueUploads(files: QueuedUpload[]): void {
    const step = this.state.steps.uploadFiles;
    const fileUploader = step.output.fileUploader;

    if (!isDefined(fileUploader) || files.length === 0) {
      return;
    }

    step.status = 'in_progress';
    this.totalQueued += files.length;

    if (this.verbose) {
      this.state.addEvent({
        message: `Uploading ${files.map(({ builtPath }) => builtPath).join(', ')}`,
        status: 'info',
      });
    }

    for (const { sourcePath } of files) {
      this.state.updateEntityStatus(sourcePath, 'uploading');
    }
    this.notify();

    const uploadPromise = fileUploader
      .uploadFiles(
        files.map(({ builtPath, fileFolder }) => ({ builtPath, fileFolder })),
      )
      .then((failures) => {
        for (const failure of failures) {
          this.failedCount++;
          this.state.addEvent({
            message: `Failed to upload ${failure.builtPath}: ${failure.error}`,
            status: 'error',
          });
        }

        for (const { builtPath, sourcePath } of files) {
          if (failures.some((failure) => failure.builtPath === builtPath)) {
            continue;
          }

          this.uploadedCount++;

          if (this.verbose) {
            this.state.addEvent({
              message: `Successfully uploaded ${builtPath}`,
              status: 'success',
            });
          }
          this.state.updateEntityStatus(sourcePath, 'success');
        }
      })
      .catch((error) => {
        this.failedCount += files.length;
        this.state.addEvent({
          message: `Upload failed: ${error}`,
          status: 'error',
        });
      })
      .finally(() => {
        step.output.activeUploads.delete(uploadPromise);

        if (step.output.activeUploads.size === 0) {
          this.logUploadSummary();
          step.status = 'done';
          this.notify();
        }
      });

    step.output.activeUploads.add(uploadPromise);
  }
}
