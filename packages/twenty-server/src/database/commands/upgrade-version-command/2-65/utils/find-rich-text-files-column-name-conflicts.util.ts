import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RICH_TEXT_FILES_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-65/constants/rich-text-files-column-name-suffix.constant';

type FieldReference = {
  id: string;
  name: string;
  type: FieldMetadataType;
  objectMetadataId: string;
};

export const findRichTextFilesColumnNameConflicts = (
  fields: FieldReference[],
): { richTextFieldId: string; conflictingFieldId: string }[] => {
  const fieldIdByObjectAndName = new Map(
    fields.map(({ id, name, objectMetadataId }) => [
      `${objectMetadataId}.${name}`,
      id,
    ]),
  );

  return fields.flatMap(({ id, name, type, objectMetadataId }) => {
    const conflictingFieldId = fieldIdByObjectAndName.get(
      `${objectMetadataId}.${name}${RICH_TEXT_FILES_COLUMN_NAME_SUFFIX}`,
    );

    return type === FieldMetadataType.RICH_TEXT && isDefined(conflictingFieldId)
      ? [{ richTextFieldId: id, conflictingFieldId }]
      : [];
  });
};
