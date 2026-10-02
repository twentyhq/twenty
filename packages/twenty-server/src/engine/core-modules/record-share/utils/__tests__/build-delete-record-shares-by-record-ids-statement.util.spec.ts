import { buildDeleteRecordSharesByRecordIdsStatement } from 'src/engine/core-modules/record-share/utils/build-delete-record-shares-by-record-ids-statement.util';

const DELETE_STATEMENT_TEXT =
  'DELETE FROM "workspace_abc"."recordShare" WHERE "objectMetadataId" = $1 AND "recordId" = ANY($2::uuid[])';

describe('buildDeleteRecordSharesByRecordIdsStatement', () => {
  const args = {
    recordShareTableExpression: '"workspace_abc"."recordShare"',
    objectMetadataId: 'object-metadata-id',
    recordIds: ['record-1', 'record-2'],
  };

  it('should delete the shares of the given records of one object in a single statement', () => {
    expect(buildDeleteRecordSharesByRecordIdsStatement(args)).toEqual({
      text: DELETE_STATEMENT_TEXT,
      values: ['object-metadata-id', ['record-1', 'record-2']],
    });
  });

  it('should return the deleted grants when asked', () => {
    expect(
      buildDeleteRecordSharesByRecordIdsStatement({
        ...args,
        shouldReturnDeletedGrants: true,
      }).text,
    ).toBe(
      `${DELETE_STATEMENT_TEXT} RETURNING "recordId", "principalId", "accessLevel", "deletedAt"`,
    );
  });
});
