/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { useMemo, useState } from 'react';
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemsAsFilterDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { lastShowPageRecordIdState } from '@/object-record/record-field/states/lastShowPageRecordId';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { useRecordIdsFromFindManyCacheRootQuery } from '@/object-record/record-show/hooks/useRecordIdsFromFindManyCacheRootQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isNonEmptyString } from '@sniptt/guards';
import { capitalize } from '~/utils/string/capitalize';

export const findView = ({
  viewId,
  objectMetadataItemId,
  views,
}: {
  viewId: string | null;
  objectMetadataItemId: string;
  views: View[];
}) => {
  if (!viewId) {
    return views.find(
      (view: any) =>
        view.key === 'INDEX' && view?.objectMetadataId === objectMetadataItemId,
    ) as View;
  } else {
    return views.find(
      (view: any) =>
        view?.id === viewId && view?.objectMetadataId === objectMetadataItemId,
    ) as View;
  }
};

export const useRecordShowPagePagination = (
  propsObjectNameSingular: string,
  propsObjectRecordId: string,
) => {
  const {
    objectNameSingular: paramObjectNameSingular,
    objectRecordId: paramObjectRecordId,
  } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewIdQueryParam = searchParams.get('view');

  const setLastShowPageRecordId = useSetRecoilState(lastShowPageRecordIdState);

  const [isLoadedRecords, setIsLoadedRecords] = useState(false);

  const objectNameSingular = propsObjectNameSingular || paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId || paramObjectRecordId;

  if (!objectNameSingular || !objectRecordId) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const view = useMemo(() => {
    return findView({
      objectMetadataItemId: objectMetadataItem?.id ?? '',
      viewId: viewIdQueryParam,
      views,
    });
  }, [viewIdQueryParam, objectMetadataItem, views]);

  const activeFieldMetadataItems = useMemo(
    () =>
      objectMetadataItem
        ? objectMetadataItem.fields.filter(
            ({ isActive, isSystem }) => isActive && !isSystem,
          )
        : [],
    [objectMetadataItem],
  );

  const filterDefinitions = formatFieldMetadataItemsAsFilterDefinitions({
    fields: activeFieldMetadataItems,
  });

  const sortDefinitions = formatFieldMetadataItemsAsSortDefinitions({
    fields: activeFieldMetadataItems,
  });

  const filter = turnObjectDropdownFilterIntoQueryFilter(
    mapViewFiltersToFilters(view?.viewFilters ?? [], filterDefinitions),
    objectMetadataItem?.fields ?? [],
  );

  const orderBy = turnSortsIntoOrderBy(
    objectMetadataItem,
    mapViewSortsToSorts(view?.viewSorts ?? [], sortDefinitions),
  );

  const recordGqlFields = generateDepthOneRecordGqlFields({
    objectMetadataItem,
  });

  const { state } = useLocation();

  const cursorFromIndexPage = state.cursor;

  const { loading: loadingCurrentRecord, pageInfo: currentRecordsPageInfo } =
    useFindManyRecords({
      filter: {
        id: { eq: objectRecordId },
      },
      orderBy,
      skip: isLoadedRecords,
      limit: 1,
      objectNameSingular,
      recordGqlFields,
    });

  const currentRecordCursor = currentRecordsPageInfo?.endCursor;

  const cursor = cursorFromIndexPage ?? currentRecordCursor;

  const {
    loading: loadingRecordBefore,
    records: recordsBefore,
    pageInfo: pageInfoBefore,
    totalCount: totalCountBefore,
  } = useFindManyRecords({
    filter,
    orderBy,
    skip: isLoadedRecords,
    cursorFilter: isNonEmptyString(cursor)
      ? {
          cursorDirection: 'before',
          cursor: cursor,
          limit: 1,
        }
      : undefined,
    objectNameSingular,
    recordGqlFields,
  });

  const {
    loading: loadingRecordAfter,
    records: recordsAfter,
    pageInfo: pageInfoAfter,
    totalCount: totalCountAfter,
  } = useFindManyRecords({
    filter,
    orderBy,
    skip: isLoadedRecords,
    cursorFilter: cursor
      ? {
          cursorDirection: 'after',
          cursor: cursor,
          limit: 1,
        }
      : undefined,
    objectNameSingular,
    recordGqlFields,
  });

  const totalCount = Math.max(totalCountBefore ?? 0, totalCountAfter ?? 0);

  const loading =
    loadingRecordAfter || loadingRecordBefore || loadingCurrentRecord;

  const isThereARecordBefore = recordsBefore.length > 0;
  const isThereARecordAfter = recordsAfter.length > 0;

  const recordBefore = recordsBefore[0];
  const recordAfter = recordsAfter[0];

  const recordBeforeCursor = pageInfoBefore?.endCursor;
  const recordAfterCursor = pageInfoAfter?.endCursor;

  const navigateToPreviousRecord = () => {
    navigate(
      `/object/${objectNameSingular}/${recordBefore.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
      {
        state: {
          cursor: recordBeforeCursor,
        },
      },
    );
  };

  const navigateToNextRecord = () => {
    navigate(
      `/object/${objectNameSingular}/${recordAfter.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
      {
        state: {
          cursor: recordAfterCursor,
        },
      },
    );
  };

  const navigateToIndexView = () => {
    const indexPath = `/objects/${objectMetadataItem.namePlural}${
      viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
    }`;

    setLastShowPageRecordId(objectRecordId);

    navigate(indexPath);
  };

  const { recordIdsInCache } = useRecordIdsFromFindManyCacheRootQuery({
    objectNamePlural: objectMetadataItem.namePlural,
    fieldVariables: {
      filter,
      orderBy,
    },
  });

  const rankInView = recordIdsInCache.findIndex((id) => id === objectRecordId);

  const rankFoundInFiew = rankInView > -1;

  const objectLabel = capitalize(objectMetadataItem.namePlural);

  const viewNameWithCount = rankFoundInFiew
    ? `${rankInView + 1} of ${totalCount} in ${objectLabel}`
    : `${objectLabel} (${totalCount})`;

  return {
    viewName: viewNameWithCount,
    hasPreviousRecord: isThereARecordBefore,
    isLoadingPagination: loading,
    hasNextRecord: isThereARecordAfter,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
  };
};
