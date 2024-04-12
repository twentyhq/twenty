import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { IconPlus } from '@/ui/display/icon';
import { Button } from '@/ui/input/button/components/Button';
import { IconButton } from '@/ui/input/button/components/IconButton';
import { useViewBar } from '@/views/hooks/useViewBar';
import {
  IconPlayCard,
  IconPlayerPlay,
  IconPlayerPlayFilled,
} from '@tabler/icons-react';
import React from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilValue } from 'recoil';

type PageAddButtonProps = {
  onClick: () => void;
};

export const PageAddButton = ({ onClick }: PageAddButtonProps) => {
  const [enableTrigger, setEnableTrigger] = React.useState(false);

  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { createOneRecord: createOneObject } = useCreateOneRecord({
    objectNameSingular,
  });

  const recordIndexId = objectNamePlural ?? '';
  const {
    setTableFilters,
    setTableSorts,
    setTableColumns,
    getSelectedRowIdsSelector,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const selectedRowIds = useRecoilValue(getSelectedRowIdsSelector());
  console.log('=========', selectedRowIds);

  useEffect(() => {
    if (objectNamePlural === 'campaignLists') {
      if (selectedRowIds.length == 1) {
        setEnableTrigger(true);
      } else {
        setEnableTrigger(false);
      }
    }
  }, [selectedRowIds]);

  return (
    <>
      <IconButton
        Icon={IconPlus}
        dataTestId="add-button"
        size="medium"
        variant="secondary"
        accent="default"
        onClick={onClick}
        ariaLabel="Add"
      />

      {enableTrigger && (
        <Button
          title="Run Campaign"
          variant="primary"
          accent="dark"
          Icon={IconPlayerPlay}
        />
      )}
    </>
  );
};
