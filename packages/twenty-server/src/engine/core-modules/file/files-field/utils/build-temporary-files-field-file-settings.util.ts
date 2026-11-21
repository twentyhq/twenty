import { FieldMetadataType } from 'twenty-shared/types';

import { RICH_TEXT_FIELD_TEMPORARY_FILE_MAX_AGE_MS } from 'src/engine/core-modules/file/files-field/constants/rich-text-field-temporary-file-max-age-ms.constant';
import { type FileSettings } from 'src/engine/core-modules/file/types/file-settings.type';

// The expiry marks a rich text upload a body may claim: files uploaded for a rich text field before it existed have none.
export const buildTemporaryFilesFieldFileSettings = ({
  fieldMetadataType,
  now,
}: {
  fieldMetadataType: FieldMetadataType | undefined;
  now: Date;
}): FileSettings => ({
  isTemporaryFile: true,
  toDelete: false,
  ...(fieldMetadataType === FieldMetadataType.RICH_TEXT && {
    expiresAt: new Date(
      now.getTime() + RICH_TEXT_FIELD_TEMPORARY_FILE_MAX_AGE_MS,
    ).toISOString(),
  }),
});
