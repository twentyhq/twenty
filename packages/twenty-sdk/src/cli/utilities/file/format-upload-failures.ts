import { type FileUploadFailure } from '@/cli/utilities/file/file-uploader';

export const formatUploadFailures = (
  failures: FileUploadFailure[],
): string[] => {
  const builtPathsByError = new Map<string, string[]>();

  for (const { builtPath, error } of failures) {
    builtPathsByError.set(error, [
      ...(builtPathsByError.get(error) ?? []),
      builtPath,
    ]);
  }

  return [...builtPathsByError.entries()].flatMap(([error, builtPaths]) =>
    builtPaths.length === 1
      ? [`Failed to upload ${builtPaths[0]}: ${error}`]
      : [
          `Failed to upload ${builtPaths.length} files: ${error}`,
          ...builtPaths.map((builtPath) => `  ${builtPath}`),
        ],
  );
};
