export const buildLocalChildProcessNodeFlags = ({
  readableDirectories,
  writableDirectory,
  shouldAllowNetwork,
}: {
  readableDirectories: string[];
  writableDirectory: string;
  shouldAllowNetwork: boolean;
}): string[] => [
  '--permission',
  // Published apps ship prebuilt native addons (e.g. sharp); addons are not covered by the permission model.
  '--allow-addons',
  '--disable-warning=SecurityWarning',
  ...(shouldAllowNetwork
    ? ['--allow-net', '--disable-warning=ExperimentalWarning']
    : []),
  ...readableDirectories.map(
    (readableDirectory) => `--allow-fs-read=${readableDirectory}`,
  ),
  `--allow-fs-write=${writableDirectory}`,
];
