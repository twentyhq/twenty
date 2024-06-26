import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNamePluralFromSingular } from '@/object-metadata/hooks/useObjectNamePluralFromSingular';
import { formatFieldMetadataItemsAsFilterDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { formatFieldMetadataItemsAsSortDefinitions } from '@/object-metadata/utils/formatFieldMetadataItemsAsSortDefinitions';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { turnObjectDropdownFilterIntoQueryFilter } from '@/object-record/record-filter/utils/turnObjectDropdownFilterIntoQueryFilter';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
import { mapViewSortsToSorts } from '@/views/utils/mapViewSortsToSorts';
import { isDefined } from '~/utils/isDefined';

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
  const [hasPreviousRecord, setHasPreviousRecord] = useState(false);
  const [hasNextRecord, setHasNextRecord] = useState(false);
  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [viewName, setViewName] = useState('');
  const [objectRecords, setObjectRecords] = useState<ObjectRecord[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoadedRecords, setIsLoadedRecords] = useState(false);
  const [isLoadingPagination, setIsLoadingPagination] = useState(true);
  const [hasNextPage, setHasNextPage] = useState<boolean | undefined>();

  const objectNameSingular = propsObjectNameSingular || paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId || paramObjectRecordId;

  if (!objectNameSingular || !objectRecordId) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const { objectNamePlural } = useObjectNamePluralFromSingular({
    objectNameSingular,
  });

  const { records: views } = usePrefetchedData(PrefetchKey.AllViews);

  const view = useMemo(() => {
    if (!viewIdQueryParam) {
      return views.find(
        (view: any) =>
          view.key === 'INDEX' &&
          view?.objectMetadataId === objectMetadataItem.id,
      ) as View;
    } else {
      return views.find(
        (view: any) =>
          view?.id === viewIdQueryParam &&
          view?.objectMetadataId === objectMetadataItem.id,
      ) as View;
    }
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

  const { fetchMoreRecords } = useFindManyRecords({
    filter,
    orderBy,
    skip: isLoadedRecords,
    objectNameSingular,
    recordGqlFields: generateDepthOneRecordGqlFields({
      objectMetadataItem,
    }),
    onCompleted: (records, options) => {
      setObjectRecords(records);
      setTotalRecords(options?.totalCount ?? 0);
      setHasNextPage(options?.pageInfo?.hasNextPage);
      setIsLoadingPagination(false);
    },
  });

  useEffect(() => {
    if (
      !isLoadingPagination &&
      objectRecords.length > 0 &&
      isDefined(hasNextPage)
    ) {
      const recordIndex = objectRecords.findIndex(
        (rec) => rec.id === objectRecordId,
      );
      if (recordIndex < 0 && hasNextPage) {
        fetchMoreRecords();
      } else if (recordIndex < 0 && !hasNextPage) {
        throw new Error('Object name or Record id not found');
      }
      setHasPreviousRecord(recordIndex !== 0);
      setHasNextRecord(recordIndex !== objectRecords.length || hasNextPage);
      setCurrentRecordIndex(recordIndex);
      if (recordIndex >= 0) setIsLoadedRecords(true);
    }

    if (isDefined(view)) {
      setViewName(view.name);
    }
  }, [
    objectRecordId,
    objectMetadataItem,
    isLoadingPagination,
    objectRecords,
    hasNextPage,
    view,
    fetchMoreRecords,
    setObjectRecords,
    setHasPreviousRecord,
    setHasNextRecord,
    setCurrentRecordIndex,
    setViewName,
    setTotalRecords,
    setIsLoadedRecords,
  ]);

  useEffect(() => {
    const previousIndex = currentRecordIndex - 1;
    const nextIndex = currentRecordIndex + 1;
    setHasPreviousRecord(previousIndex >= 0);
    const nextRecordIsLast = nextIndex === objectRecords.length;

    if (nextRecordIsLast === true && hasNextPage === true) {
      setIsLoadedRecords(false);
      fetchMoreRecords();
    }
    setHasNextRecord(nextIndex < objectRecords.length);
  }, [
    hasNextPage,
    currentRecordIndex,
    objectRecords,
    setHasPreviousRecord,
    setHasNextRecord,
    fetchMoreRecords,
    setObjectRecords,
    setIsLoadedRecords,
  ]);

  const navigateToPreviousRecord = () => {
    const previousIndex = currentRecordIndex - 1;
    const prevRecord = objectRecords[previousIndex];
    navigate(
      `/object/${objectNameSingular}/${prevRecord.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
    );
    setCurrentRecordIndex(previousIndex);
  };

  const navigateToNextRecord = () => {
    const nextIndex = currentRecordIndex + 1;
    const nextRecord = objectRecords[nextIndex];
    navigate(
      `/object/${objectNameSingular}/${nextRecord.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
    );
    setCurrentRecordIndex(nextIndex);
  };

  const navigateToIndexView = () => {
    const indexPath = `/objects/${objectNamePlural}${
      viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
    }`;
    navigate(indexPath);
  };

  const currentViewName = `${
    currentRecordIndex + 1
  } of ${totalRecords} in ${viewName}`;

  return {
    viewName: currentViewName,
    hasPreviousRecord,
    isLoadingPagination,
    hasNextRecord,
    navigateToPreviousRecord,
    navigateToNextRecord,
    navigateToIndexView,
  };
};
