import { posix } from 'node:path';

export const LOCALES_DIR = 'locales';

export const COMPILED_LOCALES_DIR = posix.join(LOCALES_DIR, 'compiled');
