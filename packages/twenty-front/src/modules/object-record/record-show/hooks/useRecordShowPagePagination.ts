import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
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
  const [currentRecordPosition, setCurrentRecordPosition] = useState(0);
  const [viewName, setViewName] = useState('');
  const [objectRecords, setObjectRecords] = useState<ObjectRecord[]>([]);

  const objectNameSingular = propsObjectNameSingular || paramObjectNameSingular;
  const objectRecordId = propsObjectRecordId || paramObjectRecordId;

  if (!objectNameSingular || !objectRecordId) {
    throw new Error('Object name or Record id is not defined');
  }

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

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

  const { records, loading } = useFindManyRecords({
    filter,
    orderBy,
    skip: objectRecords.length > 0,
    objectNameSingular,
    recordGqlFields: generateDepthOneRecordGqlFields({
      objectMetadataItem,
    }),
  });

  useEffect(() => {
    if (!loading && records.length > 0) {
      const recordIndex = records.findIndex(
        (rec) => rec.id === objectRecordId,
      );
      if (recordIndex < 0) {
        throw new Error('Object name or Record id not found');
      }
      setHasPreviousRecord(recordIndex !== 0);
      setHasNextRecord(recordIndex !== records.length);
      setCurrentRecordPosition(recordIndex);
      setObjectRecords(records);
    }

    if (isDefined(view)) {
      setViewName(view.name);
    }
  }, [
    objectRecordId,
    objectMetadataItem,
    loading,
    records,
    view,
    setObjectRecords,
    setHasPreviousRecord,
    setHasNextRecord,
    setCurrentRecordPosition,
    setViewName,
  ]);

  useEffect(() => {
    setHasPreviousRecord(currentRecordPosition - 1 >= 0);
    setHasNextRecord(currentRecordPosition + 1 < objectRecords.length);
  }, [
    currentRecordPosition,
    objectRecords,
    setHasPreviousRecord,
    setHasNextRecord,
  ]);

  const navigateToPreviousRecord = () => {
    const prevRecord = objectRecords[currentRecordPosition - 1];
    navigate(
      `/object/${objectNameSingular}/${prevRecord.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
    );
    setCurrentRecordPosition(currentRecordPosition - 1);
  };

  const navigateToNextRecord = () => {
    const nextRecord = objectRecords[currentRecordPosition + 1];
    navigate(
      `/object/${objectNameSingular}/${nextRecord.id}${
        viewIdQueryParam ? `?view=${viewIdQueryParam}` : ''
      }`,
    );
    setCurrentRecordPosition(currentRecordPosition + 1);
  };

  const totalRecords = objectRecords.length;

  const currentViewName = `${
    currentRecordPosition + 1
  } of ${totalRecords} in ${viewName}`;

  return {
    viewName: currentViewName,
    hasPreviousRecord,
    hasNextRecord,
    navigateToPreviousRecord,
    navigateToNextRecord,
  };
};
