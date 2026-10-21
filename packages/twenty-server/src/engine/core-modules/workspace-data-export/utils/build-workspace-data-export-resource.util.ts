import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { FileFolder } from 'twenty-shared/types';

type ExportKey = { workspaceId: string; exportId: string };

const buildLocation = (workspaceId: string) => ({
  workspaceId,
  applicationUniversalIdentifier:
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  fileFolder: FileFolder.WorkspaceDataExport,
});

export const buildWorkspaceDataExportArchiveResource = ({
  workspaceId,
  exportId,
}: ExportKey) => ({
  ...buildLocation(workspaceId),
  resourcePath: `${exportId}.zip`,
});

export const buildWorkspaceDataExportStateResource = ({
  workspaceId,
  exportId,
}: ExportKey) => ({
  ...buildLocation(workspaceId),
  resourcePath: `${exportId}/state.json`,
});

export const buildWorkspaceDataExportPartResource = ({
  workspaceId,
  exportId,
  partName,
}: ExportKey & { partName: string }) => ({
  ...buildLocation(workspaceId),
  resourcePath: `${exportId}/parts/${partName}`,
});

export const buildWorkspaceDataExportFolder = ({
  workspaceId,
  exportId,
}: ExportKey) => ({
  ...buildLocation(workspaceId),
  folderPath: exportId,
});

export const buildWorkspaceDataExportPartsFolder = ({
  workspaceId,
  exportId,
}: ExportKey) => ({
  ...buildLocation(workspaceId),
  folderPath: `${exportId}/parts`,
});
