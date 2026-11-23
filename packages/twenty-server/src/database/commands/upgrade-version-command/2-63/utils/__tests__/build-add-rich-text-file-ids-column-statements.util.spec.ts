import { buildAddRichTextFileIdsColumnStatements } from 'src/database/commands/upgrade-version-command/2-63/utils/build-add-rich-text-file-ids-column-statements.util';

describe('buildAddRichTextFileIdsColumnStatements', () => {
  it('should add one column per rich text field, in one statement per table', () => {
    expect(
      buildAddRichTextFileIdsColumnStatements({
        schemaName: 'workspace_abc',
        richTextFields: [
          { tableName: 'note', fieldName: 'bodyV2' },
          { tableName: '_meeting', fieldName: 'brief' },
          { tableName: '_meeting', fieldName: 'summary' },
        ],
      }),
    ).toEqual([
      'ALTER TABLE "workspace_abc"."note" ADD COLUMN IF NOT EXISTS "bodyV2_fileIds" jsonb',
      'ALTER TABLE "workspace_abc"."_meeting" ADD COLUMN IF NOT EXISTS "brief_fileIds" jsonb, ADD COLUMN IF NOT EXISTS "summary_fileIds" jsonb',
    ]);
  });

  it('should return no statement when the workspace has no rich text field', () => {
    expect(
      buildAddRichTextFileIdsColumnStatements({
        schemaName: 'workspace_abc',
        richTextFields: [],
      }),
    ).toEqual([]);
  });
});
