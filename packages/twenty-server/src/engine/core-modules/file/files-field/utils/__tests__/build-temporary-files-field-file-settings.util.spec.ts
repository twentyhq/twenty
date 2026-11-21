import { FieldMetadataType } from 'twenty-shared/types';

import { buildTemporaryFilesFieldFileSettings } from 'src/engine/core-modules/file/files-field/utils/build-temporary-files-field-file-settings.util';

describe('buildTemporaryFilesFieldFileSettings', () => {
  it('should let a record claim a rich text upload', () => {
    expect(
      buildTemporaryFilesFieldFileSettings({
        fieldMetadataType: FieldMetadataType.RICH_TEXT,
      }),
    ).toEqual({
      isTemporaryFile: true,
      toDelete: false,
      isClaimableByRecord: true,
    });
  });

  it.each([FieldMetadataType.FILES, undefined])(
    'should leave a %s upload unflagged',
    (fieldMetadataType) => {
      expect(
        buildTemporaryFilesFieldFileSettings({ fieldMetadataType }),
      ).toEqual({ isTemporaryFile: true, toDelete: false });
    },
  );
});
