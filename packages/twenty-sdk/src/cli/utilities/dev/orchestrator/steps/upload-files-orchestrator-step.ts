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
    const step = this.state.steps.uploadFiles;

    if (!step.output.fileUploader) {
      return;
    }

    step.status = 'in_progress';
    this.totalQueued++;

    if (this.verbose) {
      this.state.addEvent({
        message: `Uploading ${builtPath}`,
        status: 'info',
      });
    }
    this.state.updateEntityStatus(sourcePath, 'uploading');
    this.notify();

    const uploadPromise = step.output.fileUploader
      .uploadFile({ builtPath, fileFolder })
      .then((result) => {
        if (result.success) {
          this.uploadedCount++;

          if (this.verbose) {
            this.state.addEvent({
              message: `Successfully uploaded ${builtPath}`,
              status: 'success',
            });
          }
          this.state.updateEntityStatus(sourcePath, 'success');
        } else {
          this.failedCount++;
          this.state.addEvent({
            message: `Failed to upload ${builtPath}: ${result.error}`,
            status: 'error',
          });
        }
      })
      .catch((error) => {
        this.failedCount++;
        this.state.addEvent({
          message: `Upload failed for ${builtPath}: ${error}`,
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

  // The initial upload covers the whole app, so it goes through the batched
  // direct-upload flow instead of one rate-limited api call per file.
  private uploadPendingFiles(): void {
    const step = this.state.steps.uploadFiles;
    const fileUploader = step.output.fileUploader;
    const pendingFiles = Array.from(step.output.builtFileInfos.entries());

    if (!isDefined(fileUploader) || pendingFiles.length === 0) {
      return;
    }

    step.status = 'in_progress';
    this.totalQueued += pendingFiles.length;

    if (this.verbose) {
      this.state.addEvent({
        message: `Uploading ${pendingFiles.length} files`,
        status: 'info',
      });
    }

    for (const [, { sourcePath }] of pendingFiles) {
      this.state.updateEntityStatus(sourcePath, 'uploading');
    }
    this.notify();

    const uploadPromise = fileUploader
      .uploadFiles(
        pendingFiles.map(([builtPath, { fileFolder }]) => ({
          builtPath,
          fileFolder,
        })),
      )
      .then((failures) => {
        for (const failure of failures) {
          this.failedCount++;
          this.state.addEvent({
            message: `Failed to upload ${failure.builtPath}: ${failure.error}`,
            status: 'error',
          });
        }

        for (const [builtPath, { sourcePath }] of pendingFiles) {
          if (failures.some((failure) => failure.builtPath === builtPath)) {
            continue;
          }

          this.uploadedCount++;
          this.state.updateEntityStatus(sourcePath, 'success');
        }
      })
      .catch((error) => {
        this.failedCount += pendingFiles.length;
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
