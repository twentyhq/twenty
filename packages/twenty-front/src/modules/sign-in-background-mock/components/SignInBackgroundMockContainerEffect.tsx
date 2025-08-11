import { useEffect } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { useSetTableColumns } from '@/object-record/record-table/hooks/useSetTableColumns';
import { SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockColumnDefinitions';
import { SIGN_IN_BACKGROUND_MOCK_VIEW_FIELDS } from '@/sign-in-background-mock/constants/SignInBackgroundMockViewFields';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
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
  const [
    contextStoreCurrentObjectMetadataItemId,
    setContextStoreCurrentObjectMetadataItemId,
  ] = useRecoilComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { setAvailableTableColumns } = useRecordTable({
    recordTableId,
  });

  const { setTableColumns } = useSetTableColumns();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { setAvailableFieldDefinitions, setViewObjectMetadataId } =
    useInitViewBar(viewId);

  useEffect(() => {
    setViewObjectMetadataId?.(objectMetadataItem.id);

    setAvailableFieldDefinitions?.(SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS);

    setAvailableTableColumns(SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS);

    setTableColumns(
      mapViewFieldsToColumnDefinitions({
        viewFields: SIGN_IN_BACKGROUND_MOCK_VIEW_FIELDS,
        columnDefinitions: SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS,
      }),
      recordTableId,
      objectMetadataItem.id,
    );

    if (contextStoreCurrentObjectMetadataItemId !== objectMetadataItem.id) {
      setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    }
  }, [
    setViewObjectMetadataId,
    setAvailableFieldDefinitions,
    objectMetadataItem,
    setAvailableTableColumns,
    setTableColumns,
    recordTableId,
    setContextStoreCurrentObjectMetadataItemId,
    contextStoreCurrentObjectMetadataItemId,
  ]);

  return <></>;
};
