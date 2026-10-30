import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

export const buildWorkspaceDataExportFolder = ({
  workspaceId,
  exportId,
  folder,
}: {
  workspaceId: string;
  exportId: string;
  folder: 'export' | 'parts';
}) => ({
  workspaceId,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  fileFolder: FileFolder.WorkspaceDataExport,
  folderPath: folder === 'parts' ? `${exportId}/parts` : exportId,
});
