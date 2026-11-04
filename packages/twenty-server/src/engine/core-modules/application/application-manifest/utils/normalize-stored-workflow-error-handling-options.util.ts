import { type StoredWorkflowErrorHandlingOptions } from 'src/engine/core-modules/application/application-manifest/types/stored-workflow-version-definition.type';

// Older builders stored the retry count as a boolean, which runs read as Number(value)
export const normalizeStoredWorkflowErrorHandlingOptions = ({
  retryOnFailure,
  continueOnFailure,
}: StoredWorkflowErrorHandlingOptions) => ({
  retryOnFailure: { value: Number(retryOnFailure.value) },
  continueOnFailure: { value: continueOnFailure.value },
});
