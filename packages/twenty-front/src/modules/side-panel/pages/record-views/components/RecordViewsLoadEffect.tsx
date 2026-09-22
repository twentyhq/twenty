import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { recordViewsResultComponentState } from '@/side-panel/pages/record-views/states/recordViewsResultComponentState';
import { recordViewsRetryCountComponentState } from '@/side-panel/pages/record-views/states/recordViewsRetryCountComponentState';
import { type RecordViewsTarget } from '@/side-panel/pages/record-views/types/RecordViewsTarget';
import { getRecordViewFilter } from '@/side-panel/pages/record-views/utils/getRecordViewFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { type View } from '@/views/types/View';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

const RECORD_GQL_FIELDS = { id: true };
const VIEW_QUERY_CONCURRENCY = 5;

export const RecordViewsLoadEffect = ({
  objectNameSingular,
  recordId,
}: RecordViewsTarget) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const views = useAtomFamilySelectorValue(
    viewsFromObjectMetadataItemFamilySelector,
    {
      objectMetadataItemId: objectMetadataItem.id,
    },
  );
  const flattenedFieldMetadataItems = useAtomStateValue(
    flattenedFieldMetadataItemsSelector,
  );
  const { filterValueDependencies } = useFilterValueDependencies();
  const { canReadObjectRecords } = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );
  const client = useApolloCoreClient();
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields: RECORD_GQL_FIELDS,
  });
  const setResult = useSetAtomComponentState(recordViewsResultComponentState);
  const retryCount = useAtomComponentStateValue(
    recordViewsRetryCountComponentState,
  );

  useEffect(() => {
    let cancelled = false;

    const loadViews = async () => {
      setResult({ views: [], loading: true, error: false });

      try {
        const matchingViews: View[] = [];
        const candidateViews = canReadObjectRecords ? views : [];

        for (
          let offset = 0;
          offset < candidateViews.length;
          offset += VIEW_QUERY_CONCURRENCY
        ) {
          if (cancelled) {
            return;
          }

          const matches = await Promise.all(
            candidateViews
              .slice(offset, offset + VIEW_QUERY_CONCURRENCY)
              .map(async (view) => {
                const filter = getRecordViewFilter({
                  view,
                  recordId,
                  objectFields: objectMetadataItem.fields,
                  fieldMetadataItems: flattenedFieldMetadataItems,
                  filterValueDependencies,
                });

                if (!isDefined(filter)) {
                  return undefined;
                }

                const response =
                  await client.query<RecordGqlOperationFindManyResult>({
                    query: findManyRecordsQuery,
                    variables: { filter, limit: 1 },
                    fetchPolicy: 'no-cache',
                    errorPolicy: 'none',
                  });

                return response.data?.[
                  objectMetadataItem.namePlural
                ]?.edges.some(({ node }) => node.id === recordId)
                  ? view
                  : undefined;
              }),
          );

          matchingViews.push(...matches.filter(isDefined));
        }

        if (!cancelled) {
          setResult({ views: matchingViews, loading: false, error: false });
        }
      } catch {
        if (!cancelled) {
          setResult({ views: [], loading: false, error: true });
        }
      }
    };

    void loadViews();

    return () => {
      cancelled = true;
    };
  }, [
    client,
    findManyRecordsQuery,
    views,
    recordId,
    objectMetadataItem.fields,
    objectMetadataItem.namePlural,
    flattenedFieldMetadataItems,
    filterValueDependencies,
    canReadObjectRecords,
    retryCount,
    setResult,
  ]);

  return null;
};
