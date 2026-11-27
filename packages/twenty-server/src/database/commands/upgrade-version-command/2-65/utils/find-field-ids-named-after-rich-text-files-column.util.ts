import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RICH_TEXT_FILES_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-65/constants/rich-text-files-column-name-suffix.constant';

export const findFieldIdsNamedAfterRichTextFilesColumn = (
  fields: {
    id: string;
    name: string;
    type: FieldMetadataType;
    objectMetadataId: string;
  }[],
): string[] => {
  const fieldIdByObjectAndName = new Map(
    fields.map(({ id, name, objectMetadataId }) => [
      `${objectMetadataId}.${name}`,
      id,
    ]),
  );

  return fields
    .filter(({ type }) => type === FieldMetadataType.RICH_TEXT)
    .map(({ name, objectMetadataId }) =>
      fieldIdByObjectAndName.get(
        `${objectMetadataId}.${name}${RICH_TEXT_FILES_COLUMN_NAME_SUFFIX}`,
      ),
    )
    .filter(isDefined);
};
