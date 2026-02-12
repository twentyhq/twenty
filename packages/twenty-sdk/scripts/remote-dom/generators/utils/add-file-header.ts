import { type SourceFile } from 'ts-morph';

import { GENERATED_FILE_HEADER } from './generated-file-header';

export const addFileHeader = (sourceFile: SourceFile): void => {
  sourceFile.insertText(0, GENERATED_FILE_HEADER + '\n\n');
};
