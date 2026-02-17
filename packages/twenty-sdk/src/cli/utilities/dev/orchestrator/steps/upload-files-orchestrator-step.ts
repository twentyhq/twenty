import {
  type OrchestratorState,
  type OrchestratorStateBuiltFileInfo,
  type OrchestratorStateStepStatus,
} from '@/cli/utilities/dev/orchestrator/dev-mode-orchestrator-state';
import { FileUploader } from '@/cli/utilities/file/file-uploader';
import { type FileFolder } from 'twenty-shared/types';

export type UploadFilesOrchestratorStepInput = Record<string, never>;

export type UploadFilesOrchestratorStepOutput = {
  fileUploader: FileUploader | null;
  builtFileInfos: Map<string, OrchestratorStateBuiltFileInfo>;
  activeUploads: Set<Promise<void>>;
};

export type UploadFilesOrchestratorStepState = {
  input: UploadFilesOrchestratorStepInput;
  output: UploadFilesOrchestratorStepOutput;
  status: OrchestratorStateStepStatus;
};

export class UploadFilesOrchestratorStep {
  initialize(
    stepOutput: Readonly<UploadFilesOrchestratorStepOutput>,
    input: { appPath: string; universalIdentifier: string },
  ): UploadFilesOrchestratorStepOutput {
    return {
      ...stepOutput,
      fileUploader: new FileUploader({
        appPath: input.appPath,
        applicationUniversalIdentifier: input.universalIdentifier,
      }),
    };
  }

  uploadFile(
    state: OrchestratorState,
    builtPath: string,
    sourcePath: string,
    fileFolder: FileFolder,
  ): void {
    if (!state.steps.uploadFiles.output.fileUploader) {
      return;
    }

    state.addEvent({
      message: `Uploading ${builtPath}`,
      status: 'info',
    });
    state.updateEntityStatus(sourcePath, 'uploading');

    const uploadPromise = state.steps.uploadFiles.output.fileUploader
      .uploadFile({ builtPath, fileFolder })
      .then((result) => {
        if (result.success) {
          state.addEvent({
            message: `Successfully uploaded ${builtPath}`,
            status: 'success',
          });
          state.updateEntityStatus(sourcePath, 'success');
        } else {
          state.addEvent({
            message: `Failed to upload ${builtPath}: ${result.error}`,
            status: 'error',
          });
        }
      })
      .catch((error) => {
        state.addEvent({
          message: `Upload failed for ${builtPath}: ${error}`,
          status: 'error',
        });
      })
      .finally(() => {
        state.steps.uploadFiles.output.activeUploads.delete(uploadPromise);
      });

    state.steps.uploadFiles.output.activeUploads.add(uploadPromise);
  }

  async waitForUploads(state: OrchestratorState): Promise<void> {
    while (state.steps.uploadFiles.output.activeUploads.size > 0) {
      await Promise.all(state.steps.uploadFiles.output.activeUploads);
    }
  }
}
