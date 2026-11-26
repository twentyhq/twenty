import { FieldMetadataType } from 'twenty-shared/types';

import { readFilesValue } from 'src/engine/core-modules/file/files-field/utils/read-files-value.util';

const FILES = [{ fileId: 'file-id', label: 'notes.txt' }];

describe('readFilesValue', () => {
  it('should read the value of a files field', () => {
    expect(
      readFilesValue({
        record: { documents: FILES },
        field: { name: 'documents', type: FieldMetadataType.FILES },
      }),
    ).toEqual(FILES);
  });

  it('should read the files sub-field of a rich text field', () => {
    expect(
      readFilesValue({
        record: { body: { markdown: 'Notes', files: FILES } },
        field: { name: 'body', type: FieldMetadataType.RICH_TEXT },
      }),
    ).toEqual(FILES);
  });

  it.each([{ body: { markdown: 'Notes' } }, { body: null }, {}, undefined])(
    'should read nothing from %j, which lists no files',
    (record) => {
      expect(
        readFilesValue({
          record,
          field: { name: 'body', type: FieldMetadataType.RICH_TEXT },
        }),
      ).toBeUndefined();
    },
  );
});
