import { useEffect } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockColumnDefinitions';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { useInitViewBar } from '@/views/hooks/useInitViewBar';

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

  const setCurrentRecordFields = useSetRecoilComponentState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

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

    const recordFields = SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS.filter(
      (fieldDefinition) => fieldDefinition.fieldMetadataId !== '',
    ).map(
      (columnDefinitionMock) =>
        ({
          fieldMetadataItemId: columnDefinitionMock.fieldMetadataId,
          id: columnDefinitionMock.fieldMetadataId,
          isVisible: columnDefinitionMock.isVisible,
          position: columnDefinitionMock.position,
          size: columnDefinitionMock.size,
        }) satisfies RecordField as RecordField,
    );

    setCurrentRecordFields(recordFields);

    if (contextStoreCurrentObjectMetadataItemId !== objectMetadataItem.id) {
      setContextStoreCurrentObjectMetadataItemId(objectMetadataItem.id);
    }
  }, [
    setViewObjectMetadataId,
    setAvailableFieldDefinitions,
    objectMetadataItem,
    recordTableId,
    setContextStoreCurrentObjectMetadataItemId,
    contextStoreCurrentObjectMetadataItemId,
    setCurrentRecordFields,
  ]);

  return <></>;
};
