import { isAllRecordGroupsTabFilteredByVisibleGroups } from '@/object-record/record-group/utils/isAllRecordGroupsTabFilteredByVisibleGroups';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const selectField = { type: FieldMetadataType.SELECT, relation: null };

const manyToOneRelationField = {
  type: FieldMetadataType.RELATION,
  relation: { type: RelationType.MANY_TO_ONE },
};

describe('isAllRecordGroupsTabFilteredByVisibleGroups', () => {
  it('should not filter a select grouping with no hidden group', () => {
    expect(
      isAllRecordGroupsTabFilteredByVisibleGroups({
        hiddenRecordGroupIds: [],
        recordGroupFieldMetadata: selectField,
      }),
    ).toBe(false);
  });

  it('should filter a select grouping with a hidden group', () => {
    expect(
      isAllRecordGroupsTabFilteredByVisibleGroups({
        hiddenRecordGroupIds: ['group-done'],
        recordGroupFieldMetadata: selectField,
      }),
    ).toBe(true);
  });

  it('should filter a many-to-one relation grouping with no hidden group', () => {
    expect(
      isAllRecordGroupsTabFilteredByVisibleGroups({
        hiddenRecordGroupIds: [],
        recordGroupFieldMetadata: manyToOneRelationField,
      }),
    ).toBe(true);
  });

  it('should not filter when the grouping field is unknown', () => {
    expect(
      isAllRecordGroupsTabFilteredByVisibleGroups({
        hiddenRecordGroupIds: [],
        recordGroupFieldMetadata: undefined,
      }),
    ).toBe(false);
  });
});
