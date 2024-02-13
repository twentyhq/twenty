import { useEffect } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useRecordActionBar } from '@/object-record/record-action-bar/hooks/useRecordActionBar';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import {
  signInBackgroundMockColumnDefinitions,
  signInBackgroundMockFilterDefinitions,
  signInBackgroundMockSortDefinitions,
} from '@/sign-in-background-mock/constants/signInBackgroundMockDefinitions';
import { signInBackgroundMockViewFields } from '@/sign-in-background-mock/constants/signInBackgroundMockViewFields';
import { useViewBar } from '@/views/hooks/useViewBar';
import { mapViewFieldsToColumnDefinitions } from '@/views/utils/mapViewFieldsToColumnDefinitions';

type SignInBackgroundMockContainerEffectProps = {
  objectNamePlural: string;
  recordTableId: string;
  viewId: string;
};

export const SignInBackgroundMockContainerEffect = ({
  objectNamePlural,
  recordTableId,
  viewId,
}: SignInBackgroundMockContainerEffectProps) => {
  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    setTableColumns,
    resetTableRowSelection,
  } = useRecordTable({
    recordTableId,
  });

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const {
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
    setEntityCountInCurrentView,
  } = useViewBar({ viewBarId: viewId });

  useEffect(() => {
    setViewObjectMetadataId?.(objectMetadataItem.id);

    setAvailableSortDefinitions?.(signInBackgroundMockSortDefinitions);
    setAvailableFilterDefinitions?.(signInBackgroundMockFilterDefinitions);
    setAvailableFieldDefinitions?.(signInBackgroundMockColumnDefinitions);

    setAvailableTableColumns(signInBackgroundMockColumnDefinitions);

    setTableColumns(
      mapViewFieldsToColumnDefinitions({
        viewFields: signInBackgroundMockViewFields,
        columnDefinitions: signInBackgroundMockColumnDefinitions,
      }),
    );
  }, [
    setViewObjectMetadataId,
    setAvailableSortDefinitions,
    setAvailableFilterDefinitions,
    setAvailableFieldDefinitions,
    objectMetadataItem,
    setAvailableTableColumns,
    setTableColumns,
  ]);

  const { setActionBarEntries, setContextMenuEntries } = useRecordActionBar({
    objectMetadataItem,
    selectedRecordIds: [],
    callback: resetTableRowSelection,
  });

  useEffect(() => {
    setActionBarEntries?.();
    setContextMenuEntries?.();
  }, [setActionBarEntries, setContextMenuEntries]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setEntityCountInCurrentView(entityCount),
    );
  }, [setEntityCountInCurrentView, setOnEntityCountChange]);

  return <></>;
};
