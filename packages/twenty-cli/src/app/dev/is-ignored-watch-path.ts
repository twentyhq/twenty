import { basename, sep } from 'node:path';

const IGNORED_DIRECTORIES = new Set(['node_modules', '.git', '.twenty']);

export const isIgnoredWatchPath = (filePath: string) =>
  filePath.split(sep).some((part) => IGNORED_DIRECTORIES.has(part)) ||
  basename(filePath) === '.DS_Store' ||
  /(?:~|\.sw[px]|\.tmp)$/.test(basename(filePath));
