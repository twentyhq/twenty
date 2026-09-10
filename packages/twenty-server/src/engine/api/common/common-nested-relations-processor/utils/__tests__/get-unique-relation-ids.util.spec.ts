import { type ObjectRecord } from 'twenty-shared/types';

import { getUniqueRelationIds } from 'src/engine/api/common/common-nested-relations-processor/utils/get-unique-relation-ids.util';

const buildRecords = (
  targetCompanyIds: (string | null | undefined)[],
): ObjectRecord[] =>
  targetCompanyIds.map((targetCompanyId, index) => ({
    id: `record-${index}`,
    targetCompanyId,
  })) as unknown as ObjectRecord[];

describe('getUniqueRelationIds', () => {
  it('should drop nullish join column values', () => {
    const relationIds = getUniqueRelationIds({
      records: buildRecords(['company-1', null, undefined, 'company-2']),
      idField: 'targetCompanyId',
    });

    expect(relationIds).toEqual(['company-1', 'company-2']);
  });

  it('should return no id when the join column is unset on every record', () => {
    const relationIds = getUniqueRelationIds({
      records: buildRecords([null, null, null]),
      idField: 'targetCompanyId',
    });

    expect(relationIds).toEqual([]);
  });

  it('should deduplicate repeated ids', () => {
    const relationIds = getUniqueRelationIds({
      records: buildRecords(['company-1', 'company-1', 'company-2']),
      idField: 'targetCompanyId',
    });

    expect(relationIds).toEqual(['company-1', 'company-2']);
  });

  it('should return no id for an empty record list', () => {
    expect(
      getUniqueRelationIds({ records: [], idField: 'targetCompanyId' }),
    ).toEqual([]);
  });
});
