import { type WatchScope } from '@/app/dev/types/watch-scope.type';

export const formatWatchScope = ({
  appPath,
  scope,
}: {
  appPath: string;
  scope: WatchScope;
}) =>
  [
    'Watch scope:',
    `  App folder (recursive): ${appPath}`,
    ...[
      { label: 'External files', paths: scope.filePaths },
      { label: 'External directories (shallow)', paths: scope.directoryPaths },
      { label: 'Excluded directories', paths: scope.excludedDirectoryPaths },
    ].flatMap(({ label, paths }) =>
      paths.length > 0
        ? [`  ${label}:`, ...paths.map((path) => `    ${path}`)]
        : [],
    ),
  ].join('\n');
