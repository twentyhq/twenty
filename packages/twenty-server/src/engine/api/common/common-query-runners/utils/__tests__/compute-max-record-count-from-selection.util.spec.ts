import { computeMaxRecordCountFromSelection } from 'src/engine/api/common/common-query-runners/utils/compute-max-record-count-from-selection.util';
import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';

const buildSelectedFieldsResult = ({
  relationFieldsCount,
  relationFieldsCountUnderOneToMany,
}: {
  relationFieldsCount: number;
  relationFieldsCountUnderOneToMany: number;
}): CommonSelectedFieldsResult => ({
  select: {},
  relations: {},
  aggregate: {},
  relationFieldsCount,
  relationFieldsCountUnderOneToMany,
});

describe('computeMaxRecordCountFromSelection', () => {
  it('should count only the root records when no relation is selected', () => {
    expect(
      computeMaxRecordCountFromSelection({
        rootRecordCount: 200,
        selectedFieldsResult: buildSelectedFieldsResult({
          relationFieldsCount: 0,
          relationFieldsCountUnderOneToMany: 0,
        }),
        recordLimitPerOneToManyRelation: 60,
      }),
    ).toBe(200);
  });

  it('should count one record per root record for each to-one relation', () => {
    expect(
      computeMaxRecordCountFromSelection({
        rootRecordCount: 200,
        selectedFieldsResult: buildSelectedFieldsResult({
          relationFieldsCount: 2,
          relationFieldsCountUnderOneToMany: 0,
        }),
        recordLimitPerOneToManyRelation: 60,
      }),
    ).toBe(600);
  });

  it('should count the one-to-many limit per root record for each relation under a one-to-many relation', () => {
    expect(
      computeMaxRecordCountFromSelection({
        rootRecordCount: 200,
        selectedFieldsResult: buildSelectedFieldsResult({
          relationFieldsCount: 3,
          relationFieldsCountUnderOneToMany: 2,
        }),
        recordLimitPerOneToManyRelation: 60,
      }),
    ).toBe(200 * (1 + 1 + 2 * 60));
  });

  it('should treat missing relation counts as no relation', () => {
    expect(
      computeMaxRecordCountFromSelection({
        rootRecordCount: 1,
        selectedFieldsResult: { select: {}, relations: {}, aggregate: {} },
        recordLimitPerOneToManyRelation: 60,
      }),
    ).toBe(1);
  });

  it('should be zero when no root record can be returned', () => {
    expect(
      computeMaxRecordCountFromSelection({
        rootRecordCount: 0,
        selectedFieldsResult: buildSelectedFieldsResult({
          relationFieldsCount: 1,
          relationFieldsCountUnderOneToMany: 1,
        }),
        recordLimitPerOneToManyRelation: 60,
      }),
    ).toBe(0);
  });
});
