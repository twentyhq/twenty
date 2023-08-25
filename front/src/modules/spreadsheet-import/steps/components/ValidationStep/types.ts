import type { Info } from '@/spreadsheet-import/types';

export type Meta = { __index: string; __errors?: Error | null };
export type Error = { [key: string]: Info };
export type Errors = { [id: string]: Error };
