import gql from 'graphql-tag';
import { useRecoilValue } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mapObjectMetadataToGraphQLQuery } from '@/object-metadata/utils/mapObjectMetadataToGraphQLQuery';
import { EMPTY_MUTATION } from '@/object-record/constants/EmptyMutation';
import { RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { getMergeManyRecordsMutationResponseField } from '@/object-record/utils/getMergeManyRecordsMutationResponseField';
import { capitalize } from 'twenty-shared/utils';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useMergeManyRecordsMutation = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthOneRecordGqlFields({
      objectMetadataItem,
    });

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  if (isUndefinedOrNull(objectMetadataItem)) {
    return { mergeManyRecordsMutation: EMPTY_MUTATION };
  }

  const capitalizedObjectName = capitalize(objectMetadataItem.namePlural);

  const mutationResponseField = getMergeManyRecordsMutationResponseField(
    objectMetadataItem.namePlural,
  );

  const mergeManyRecordsMutation = gql`
    mutation Merge${capitalizedObjectName}($ids: [UUID!]!, $conflictPriorityIndex: Int!, $dryRun: Boolean) {
      ${mutationResponseField}(ids: $ids, conflictPriorityIndex: $conflictPriorityIndex, dryRun: $dryRun) ${mapObjectMetadataToGraphQLQuery(
        {
          objectMetadataItems,
          objectMetadataItem,
          recordGqlFields: appliedRecordGqlFields,
          objectPermissionsByObjectMetadataId,
        },
      )}
    }
  `;

  return {
    mergeManyRecordsMutation,
  };
};
