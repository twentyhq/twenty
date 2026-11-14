import { useMemo } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type RecordGqlFields } from 'twenty-shared/types';
import { type RecordGqlRelationAlias } from '@/object-record/graphql/types/RecordGqlRelationAlias';
import { getRecordGqlRelationAliasVariables } from '@/object-record/graphql/utils/getRecordGqlRelationAliasVariables';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { generateGroupByRecordsQuery } from '@/object-record/utils/generateGroupByRecordsQuery';

export const useGroupByRecordsQuery = ({
  objectNameSingular,
  recordGqlFields,
  computeReferences,
  relationAliases,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
  computeReferences?: boolean;
  relationAliases?: RecordGqlRelationAlias[];
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const groupByRecordsQuery = useMemo(
    () =>
      generateGroupByRecordsQuery({
        objectMetadataItem,
        objectMetadataItems,
        recordGqlFields,
        computeReferences,
        objectPermissionsByObjectMetadataId,
        relationAliases,
      }),
    [
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
      objectPermissionsByObjectMetadataId,
      relationAliases,
    ],
  );

  const relationAliasVariables = useMemo(
    () => getRecordGqlRelationAliasVariables(relationAliases),
    [relationAliases],
  );

  return {
    groupByRecordsQuery,
    relationAliasVariables,
  };
};
