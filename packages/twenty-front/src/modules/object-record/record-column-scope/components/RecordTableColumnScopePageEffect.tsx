import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { scopedRelationRecordsFamilyState } from '@/object-record/record-column-scope/states/scopedRelationRecordsFamilyState';
import { computeScopedRelationQueryVariables } from '@/object-record/record-column-scope/utils/computeScopedRelationQueryVariables';
import { generateFindScopedRelationRecordsQuery } from '@/object-record/record-column-scope/utils/generateFindScopedRelationRecordsQuery';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type ViewWithRelations } from '@/views/types/ViewWithRelations';
import { useQuery } from '@apollo/client/react';
import { useStore } from 'jotai';
import { useEffect, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ScopedRelationRecordsQueryResult = Record<
  string,
  { edges: { node: RecordGqlNode }[] }
>;

type RecordTableColumnScopePageEffectProps = {
  parentRecordIds: string[];
  recordField: RecordField;
  relationFieldName: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  scopeView: ViewWithRelations | undefined;
};

export const RecordTableColumnScopePageEffect = ({
  parentRecordIds,
  recordField,
  relationFieldName,
  relationObjectMetadataItem,
  scopeView,
}: RecordTableColumnScopePageEffectProps) => {
  const store = useStore();
  const apolloCoreClient = useApolloCoreClient();
  const { objectMetadataItem } = useRecordTableContextOrThrow();
  const { objectPermissionsByObjectMetadataId } =
    useRecordIndexContextOrThrow();
  const { objectMetadataItems } = useObjectMetadataItems();
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();

  // A new document identity would make Apollo treat every render as a new query
  const scopedRelationRecordsQuery = useMemo(
    () =>
      generateFindScopedRelationRecordsQuery({
        objectMetadataItem,
        relationFieldName,
        relationObjectMetadataItem,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
      }),
    [
      objectMetadataItem,
      relationFieldName,
      relationObjectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
    ],
  );

  const { data } = useQuery<ScopedRelationRecordsQueryResult>(
    scopedRelationRecordsQuery,
    {
      client: apolloCoreClient,
      fetchPolicy: 'cache-and-network',
      variables: computeScopedRelationQueryVariables({
        parentRecordIds,
        scopeView,
        recordLimit: recordField.settings?.recordLimit,
        relationObjectMetadataItem,
        objectMetadataItems,
        fieldMetadataItems: flattenedFieldMetadataItems,
        filterValueDependencies,
      }),
    },
  );

  useEffect(() => {
    const parentConnection = data?.[objectMetadataItem.namePlural];

    if (!isDefined(parentConnection)) {
      return;
    }

    for (const { node: parentRecordNode } of parentConnection.edges) {
      const parentRecord = getRecordFromRecordNode({
        recordNode: parentRecordNode,
      });

      store.set(
        scopedRelationRecordsFamilyState.atomFamily({
          viewFieldId: recordField.id,
          recordId: parentRecord.id,
        }),
        parentRecord[relationFieldName],
      );
    }
  }, [
    data,
    objectMetadataItem.namePlural,
    recordField.id,
    relationFieldName,
    store,
  ]);

  return null;
};
