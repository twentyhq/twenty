import { FieldMetadataType } from 'twenty-shared/types';

import { findRichTextFilesColumnNameConflicts } from 'src/database/commands/upgrade-version-command/2-65/utils/find-rich-text-files-column-name-conflicts.util';

const RICH_TEXT_FIELD = {
  id: 'rich-text-field',
  name: 'summary',
  type: FieldMetadataType.RICH_TEXT,
  objectMetadataId: 'meeting',
};

describe('findRichTextFilesColumnNameConflicts', () => {
  it('should report a field of the same object named after the files column', () => {
    expect(
      findRichTextFilesColumnNameConflicts([
        RICH_TEXT_FIELD,
        {
          id: 'files-field',
          name: 'summaryFiles',
          type: FieldMetadataType.FILES,
          objectMetadataId: 'meeting',
        },
      ]),
    ).toEqual([
      { richTextFieldId: 'rich-text-field', conflictingFieldId: 'files-field' },
    ]);
  });

  it('should ignore the same name on another object or next to a field that is not rich text', () => {
    expect(
      findRichTextFilesColumnNameConflicts([
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
