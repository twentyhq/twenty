import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type FileFolder } from 'twenty-shared/types';

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

  private uploadPendingFiles(): void {
    for (const [
      builtPath,
      { fileFolder, sourcePath },
    ] of this.state.steps.uploadFiles.output.builtFileInfos.entries()) {
      this.uploadFile(builtPath, sourcePath, fileFolder);
    }
  }
}
