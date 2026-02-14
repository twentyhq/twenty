import { type DeclarationOccurrence } from './DeclarationOccurrence';

export type FileExports = Array<{
  file: string;
  exports: DeclarationOccurrence[];
}>;
