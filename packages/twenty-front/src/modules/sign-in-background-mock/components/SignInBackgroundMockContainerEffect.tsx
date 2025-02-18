import { useEffect } from 'react';

import { contextStoreCurrentObjectMetadataItemComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useSetRecordIndexEntityCount } from '@/object-record/record-index/hooks/useSetRecordIndexEntityCount';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockColumnDefinitions';
import { SIGN_IN_BACKGROUND_MOCK_SORT_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockSortDefinitions';
import { SIGN_IN_BACKGROUND_MOCK_VIEW_FIELDS } from '@/sign-in-background-mock/constants/SignInBackgroundMockViewFields';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { useInitViewBar } from '@/views/hooks/useInitViewBar';
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
  const setContextStoreCurrentObjectMetadataItem = useSetRecoilComponentStateV2(
    contextStoreCurrentObjectMetadataItemComponentState,
    'main-context-store',
  );

  const { setAvailableTableColumns, setOnEntityCountChange } = useRecordTable({
    recordTableId,
  });

  const { setTableColumns } = useSetTableColumns();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const {
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    setViewObjectMetadataId,
  } = useInitViewBar(viewId);

  const { setRecordIndexEntityCount } = useSetRecordIndexEntityCount(viewId);

  useEffect(() => {
    setViewObjectMetadataId?.(objectMetadataItem.id);

    setAvailableSortDefinitions?.(SIGN_IN_BACKGROUND_MOCK_SORT_DEFINITIONS);
    setAvailableFieldDefinitions?.(SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS);

    setAvailableTableColumns(SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS);

    setTableColumns(
      mapViewFieldsToColumnDefinitions({
        viewFields: SIGN_IN_BACKGROUND_MOCK_VIEW_FIELDS,
        columnDefinitions: SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS,
      }),
      recordTableId,
    );

    setContextStoreCurrentObjectMetadataItem(objectMetadataItem);
  }, [
    setViewObjectMetadataId,
    setAvailableSortDefinitions,
    setAvailableFieldDefinitions,
    objectMetadataItem,
    setAvailableTableColumns,
    setTableColumns,
    recordTableId,
    setContextStoreCurrentObjectMetadataItem,
  ]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setRecordIndexEntityCount(entityCount),
    );
  }, [setRecordIndexEntityCount, setOnEntityCountChange]);

  return <></>;
};
