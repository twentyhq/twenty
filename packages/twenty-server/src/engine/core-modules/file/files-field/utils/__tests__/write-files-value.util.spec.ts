import { FieldMetadataType } from 'twenty-shared/types';

import { writeFilesValue } from 'src/engine/core-modules/file/files-field/utils/write-files-value.util';

const FILES = [{ fileId: 'file-id', label: 'notes.txt' }];

describe('writeFilesValue', () => {
  it('should replace the value of a files field', () => {
    expect(
      writeFilesValue({
        record: { name: 'Meeting', documents: [] },
        field: { name: 'documents', type: FieldMetadataType.FILES },
        filesValue: FILES,
      }),
    ).toEqual({ name: 'Meeting', documents: FILES });
  });

  it('should replace the files sub-field of a rich text field and keep its text', () => {
    expect(
      writeFilesValue({
        record: { body: { markdown: 'Notes', files: [] } },
        field: { name: 'body', type: FieldMetadataType.RICH_TEXT },
        filesValue: FILES,
      }),
    ).toEqual({ body: { markdown: 'Notes', files: FILES } });
  });
});
