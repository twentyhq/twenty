export const buildLocalChildProcessNodeFlags = ({
  readableDirectories,
  writableDirectory,
  allowNetwork,
}: {
  readableDirectories: string[];
  writableDirectory: string;
  allowNetwork: boolean;
}): string[] => [
  '--permission',
  // Published apps ship prebuilt native addons (e.g. sharp); addons are not covered by the permission model.
  '--allow-addons',
  '--disable-warning=SecurityWarning',
  ...(allowNetwork
    ? ['--allow-net', '--disable-warning=ExperimentalWarning']
    : []),
  ...readableDirectories.map(
    (readableDirectory) => `--allow-fs-read=${readableDirectory}`,
  ),
  `--allow-fs-write=${writableDirectory}`,
];
