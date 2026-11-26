import { FieldMetadataType } from 'twenty-shared/types';

import { findFieldIdsNamedAfterRichTextFilesColumn } from 'src/database/commands/upgrade-version-command/2-65/utils/find-field-ids-named-after-rich-text-files-column.util';

const RICH_TEXT_FIELD = {
  id: 'rich-text-field',
  name: 'summary',
  type: FieldMetadataType.RICH_TEXT,
  objectMetadataId: 'meeting',
};

describe('findFieldIdsNamedAfterRichTextFilesColumn', () => {
  it('should return a field of the same object named after the files column', () => {
    expect(
      findFieldIdsNamedAfterRichTextFilesColumn([
        RICH_TEXT_FIELD,
        {
          id: 'files-field',
          name: 'summaryFiles',
          type: FieldMetadataType.FILES,
          objectMetadataId: 'meeting',
        },
      ]),
    ).toEqual(['files-field']);
  });

  it('should ignore the same name on another object or next to a field that is not rich text', () => {
    expect(
      findFieldIdsNamedAfterRichTextFilesColumn([
        RICH_TEXT_FIELD,
        {
          id: 'other-object-field',
          name: 'summaryFiles',
          type: FieldMetadataType.FILES,
          objectMetadataId: 'deal',
        },
        {
          id: 'text-field',
          name: 'title',
          type: FieldMetadataType.TEXT,
          objectMetadataId: 'meeting',
        },
        {
          id: 'title-files-field',
          name: 'titleFiles',
          type: FieldMetadataType.FILES,
          objectMetadataId: 'meeting',
        },
      ]),
    ).toEqual([]);
  });
});
