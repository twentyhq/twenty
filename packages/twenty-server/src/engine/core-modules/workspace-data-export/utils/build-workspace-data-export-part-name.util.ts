export const buildWorkspaceDataExportPartName = ({
  nameSingular,
  partIndex,
}: {
  nameSingular: string;
  partIndex: number;
}): string => `${nameSingular}-${String(partIndex).padStart(5, '0')}.csv`;
