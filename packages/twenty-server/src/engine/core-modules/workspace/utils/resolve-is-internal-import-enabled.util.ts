import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

// TODO(@neo773): read isInternalImportEnabled alone once isInternalMessagesImportEnabled is dropped
export const resolveIsInternalImportEnabled = ({
  workspace,
  isInternalImportColumnEnabled,
}: {
  workspace: Pick<WorkspaceEntity, 'isInternalMessagesImportEnabled'> &
    Partial<Pick<WorkspaceEntity, 'isInternalImportEnabled'>>;
  isInternalImportColumnEnabled: boolean;
}): boolean => {
  if (!isInternalImportColumnEnabled) {
    return workspace.isInternalMessagesImportEnabled;
  }

  // The new column stays hidden on servers that have not restarted since the 2.59 slow command.
  return (
    workspace.isInternalImportEnabled ??
    workspace.isInternalMessagesImportEnabled
  );
};
