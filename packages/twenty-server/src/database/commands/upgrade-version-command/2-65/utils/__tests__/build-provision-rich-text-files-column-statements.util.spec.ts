import { buildProvisionRichTextFilesColumnStatements } from 'src/database/commands/upgrade-version-command/2-65/utils/build-provision-rich-text-files-column-statements.util';

describe('buildProvisionRichTextFilesColumnStatements', () => {
  it('should add the files column of each rich text field and drop every fileIds column, in one statement per table', () => {
    expect(
      buildProvisionRichTextFilesColumnStatements({
        schemaName: 'workspace_abc',
        richTextFields: [
          { tableName: 'note', fieldName: 'bodyV2' },
          { tableName: '_meeting', fieldName: 'brief' },
          { tableName: '_meeting', fieldName: 'summary' },
        ],
        fileIdsColumns: [
          { tableName: 'note', columnName: 'bodyV2_fileIds' },
          { tableName: '_meeting', columnName: 'renamedField_fileIds' },
          { tableName: '_deal', columnName: 'deletedField_fileIds' },
        ],
      }),
    ).toEqual([
      'ALTER TABLE IF EXISTS "workspace_abc"."note" ADD COLUMN IF NOT EXISTS "bodyV2Files" jsonb, DROP COLUMN IF EXISTS "bodyV2_fileIds"',
      'ALTER TABLE IF EXISTS "workspace_abc"."_meeting" ADD COLUMN IF NOT EXISTS "briefFiles" jsonb, ADD COLUMN IF NOT EXISTS "summaryFiles" jsonb, DROP COLUMN IF EXISTS "renamedField_fileIds"',
      'ALTER TABLE IF EXISTS "workspace_abc"."_deal" DROP COLUMN IF EXISTS "deletedField_fileIds"',
    ]);
  });

  it('should return no statement when the workspace has no rich text field and no fileIds column', () => {
    expect(
      buildProvisionRichTextFilesColumnStatements({
        schemaName: 'workspace_abc',
        richTextFields: [],
        fileIdsColumns: [],
      }),
    ).toEqual([]);
  });
});
