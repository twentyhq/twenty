import { useEffect } from 'react';

import { peopleAvailableFieldDefinitions } from '@/people/constants/peopleAvailableFieldDefinitions';
import { useRecordTable } from '@/ui/object/record-table/hooks/useRecordTable';
import { useView } from '@/views/hooks/useView';
import { ViewType } from '@/views/types/ViewType';
import { personTableFilterDefinitions } from '~/pages/people/constants/personTableFilterDefinitions';
import { personTableSortDefinitions } from '~/pages/people/constants/personTableSortDefinitions';

const PeopleTableEffect = () => {
  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewType,
    setViewObjectMetadataId,
  } = useView();

  const { setAvailableTableColumns } = useRecordTable();

  useEffect(() => {
    setAvailableSortDefinitions?.(personTableSortDefinitions);
    setAvailableFilterDefinitions?.(personTableFilterDefinitions);
    setAvailableFieldDefinitions?.(peopleAvailableFieldDefinitions);
    setViewObjectMetadataId?.('person');
    setViewType?.(ViewType.Table);

    setAvailableTableColumns(peopleAvailableFieldDefinitions);
  }, [
    setAvailableFieldDefinitions,
    setAvailableFilterDefinitions,
    setAvailableSortDefinitions,
    setAvailableTableColumns,
    setViewObjectMetadataId,
    setViewType,
  ]);

  return <></>;
};

export default PeopleTableEffect;
