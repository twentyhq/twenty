import { ASSETS_DIR } from 'twenty-shared/application';

export const APPLICATION_SOURCE_GLOBS = ['**/*.ts', '**/*.tsx'];

export const APPLICATION_SOURCE_IGNORED_GLOBS = [
  '**/node_modules/**',
  `${ASSETS_DIR}/**`,
  '**/*.d.ts',
  '**/dist/**',
  '**/.twenty/**',
];
