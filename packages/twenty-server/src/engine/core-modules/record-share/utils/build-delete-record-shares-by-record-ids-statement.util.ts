/* @license Enterprise */

export const buildDeleteRecordSharesByRecordIdsStatement = ({
  recordShareTableExpression,
  objectMetadataId,
  recordIds,
  shouldReturnDeletedGrants = false,
}: {
  recordShareTableExpression: string;
  objectMetadataId: string;
  recordIds: string[];
  shouldReturnDeletedGrants?: boolean;
}): { text: string; values: unknown[] } => ({
  text: `DELETE FROM ${recordShareTableExpression} WHERE "objectMetadataId" = $1 AND "recordId" = ANY($2::uuid[])${
    shouldReturnDeletedGrants
      ? ' RETURNING "recordId", "principalId", "accessLevel", "deletedAt"'
      : ''
  }`,
  values: [objectMetadataId, recordIds],
});
