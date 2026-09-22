import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { recordViewsResultComponentState } from '@/side-panel/pages/record-views/states/recordViewsResultComponentState';
import { recordViewsRetryCountComponentState } from '@/side-panel/pages/record-views/states/recordViewsRetryCountComponentState';
import { getRecordViewFilter } from '@/side-panel/pages/record-views/utils/getRecordViewFilter';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { viewsFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/viewsFromObjectMetadataItemFamilySelector';
import { type View } from '@/views/types/View';
import { ViewType } from '@/views/types/ViewType';
import { useEffect, useMemo } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const RECORD_GQL_FIELDS = { id: true };
const VIEW_QUERY_CONCURRENCY = 5;

type RecordViewsLoadEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

type RecordViewQuery = {
  view: View;
  filter: RecordGqlOperationFilter;
};

// combineFilters collapses to the bare id predicate when a view constrains
// nothing else, so the record is in it without asking the server.
const isRecordIdOnlyFilter = (filter: RecordGqlOperationFilter) => {
  const filterKeys = Object.keys(filter);

  return filterKeys.length === 1 && filterKeys[0] === 'id';
};

export const RecordViewsLoadEffect = ({
  objectNameSingular,
  recordId,
}: RecordViewsLoadEffectProps) => {
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
  const setRecordViewsResult = useSetAtomComponentState(
    recordViewsResultComponentState,
  );
  const recordViewsRetryCount = useAtomComponentStateValue(
    recordViewsRetryCountComponentState,
  );

  const recordViewQueries = useMemo(
    () =>
      views
        // A calendar view only renders the days currently in range, so a match
        // here would promise a record the view does not show on arrival.
        .filter((view) => view.type !== ViewType.CALENDAR)
        .map((view) => ({
          view,
          filter: getRecordViewFilter({
            view,
            recordId,
            objectFields: objectMetadataItem.fields,
            fieldMetadataItems: flattenedFieldMetadataItems,
            filterValueDependencies,
          }),
        }))
        .filter((recordViewQuery): recordViewQuery is RecordViewQuery =>
          isDefined(recordViewQuery.filter),
        ),
    [
      views,
      recordId,
      objectMetadataItem.fields,
      flattenedFieldMetadataItems,
      filterValueDependencies,
    ],
  );

  const recordViewQueriesSignature = JSON.stringify(
    recordViewQueries.map(({ view, filter }) => [view.id, filter]),
  );

  useEffect(() => {
    if (!canReadObjectRecords) {
      setRecordViewsResult({
        views: [],
        loading: false,
        error: false,
        hasReadPermission: false,
      });

      return;
    }

    let cancelled = false;

    const loadViews = async () => {
      setRecordViewsResult({
        views: [],
        loading: true,
        error: false,
        hasReadPermission: true,
      });

      const matchingViews: View[] = [];
      let failureCount = 0;

      for (
        let offset = 0;
        offset < recordViewQueries.length;
        offset += VIEW_QUERY_CONCURRENCY
      ) {
        if (cancelled) {
          return;
        }

        const settledMatches = await Promise.allSettled(
          recordViewQueries
            .slice(offset, offset + VIEW_QUERY_CONCURRENCY)
            .map(async ({ view, filter }) => {
              if (isRecordIdOnlyFilter(filter)) {
                return view;
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
              ]?.edges?.some(({ node }) => node.id === recordId)
                ? view
                : undefined;
            }),
        );

        for (const settledMatch of settledMatches) {
          if (settledMatch.status === 'rejected') {
            failureCount += 1;
            continue;
          }

          if (isDefined(settledMatch.value)) {
            matchingViews.push(settledMatch.value);
          }
        }
      }

      if (cancelled) {
        return;
      }

      // A view whose query failed is dropped rather than shown as absent, but a
      // run where nothing succeeded is a failed load, not an empty result.
      const hasFailedEntirely =
        failureCount > 0 && failureCount === recordViewQueries.length;

      setRecordViewsResult({
        views: matchingViews,
        loading: false,
        error: hasFailedEntirely,
        hasReadPermission: true,
      });
    };

    void loadViews();

    return () => {
      cancelled = true;
    };
    // Re-running on the identity of views or field metadata would reset the
    // panel to its skeleton on any unrelated metadata write, so the effect
    // tracks the content of the planned queries instead.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [
    recordViewQueriesSignature,
    canReadObjectRecords,
    client,
    objectMetadataItem.namePlural,
    recordId,
    recordViewsRetryCount,
    setRecordViewsResult,
  ]);

  return null;
};
