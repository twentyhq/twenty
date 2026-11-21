import { FieldMetadataType } from 'twenty-shared/types';

import { type FileSettings } from 'src/engine/core-modules/file/types/file-settings.type';

// Files uploaded for a rich text field before bodies claimed anything lack the flag, so no record can take them.
export const buildTemporaryFilesFieldFileSettings = ({
  fieldMetadataType,
}: {
  fieldMetadataType: FieldMetadataType | undefined;
}): FileSettings => ({
  isTemporaryFile: true,
  toDelete: false,
  ...(fieldMetadataType === FieldMetadataType.RICH_TEXT && {
    isClaimableByRecord: true,
  }),
});
