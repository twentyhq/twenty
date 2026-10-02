import { type CommonSelectedFieldsResult } from 'src/engine/api/common/types/common-selected-fields-result.type';

export const computeMaxRecordCountFromSelection = ({
  rootRecordCount,
  selectedFieldsResult,
  recordLimitPerOneToManyRelation,
}: {
  rootRecordCount: number;
  selectedFieldsResult: CommonSelectedFieldsResult;
  recordLimitPerOneToManyRelation: number;
}): number => {
  const relationFieldsCount = selectedFieldsResult.relationFieldsCount ?? 0;
  const relationFieldsCountUnderOneToMany =
    selectedFieldsResult.relationFieldsCountUnderOneToMany ?? 0;
  const toOneRelationFieldsCount =
    relationFieldsCount - relationFieldsCountUnderOneToMany;

  return (
    rootRecordCount *
    (1 +
      toOneRelationFieldsCount +
      relationFieldsCountUnderOneToMany * recordLimitPerOneToManyRelation)
  );
};
