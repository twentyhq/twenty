export const buildWorkspaceDataExportFileNames = ({
  nameSingular,
  partCount,
}: {
  nameSingular: string;
  partCount: number;
}): string[] =>
  partCount === 1
    ? [`${nameSingular}.csv`]
    : Array.from(
        { length: partCount },
        (_, partIndex) => `${nameSingular}-${partIndex + 1}.csv`,
      );
