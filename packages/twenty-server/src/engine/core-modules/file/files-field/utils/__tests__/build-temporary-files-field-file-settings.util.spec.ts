import { FieldMetadataType } from 'twenty-shared/types';

import { buildTemporaryFilesFieldFileSettings } from 'src/engine/core-modules/file/files-field/utils/build-temporary-files-field-file-settings.util';

const NOW = new Date('2026-11-21T10:00:00.000Z');

describe('buildTemporaryFilesFieldFileSettings', () => {
  it('should give a rich text upload a one day expiry', () => {
    expect(
      buildTemporaryFilesFieldFileSettings({
        fieldMetadataType: FieldMetadataType.RICH_TEXT,
        now: NOW,
      }),
    ).toEqual({
      isTemporaryFile: true,
      toDelete: false,
      expiresAt: '2026-11-22T10:00:00.000Z',
    });
  });

  it.each([FieldMetadataType.FILES, undefined])(
    'should leave a %s upload without expiry',
    (fieldMetadataType) => {
      expect(
        buildTemporaryFilesFieldFileSettings({ fieldMetadataType, now: NOW }),
      ).toEqual({ isTemporaryFile: true, toDelete: false });
    },
  );
});
