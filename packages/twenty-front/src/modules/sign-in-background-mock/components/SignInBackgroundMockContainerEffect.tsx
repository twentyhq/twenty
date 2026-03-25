import { useEffect } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';

import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockColumnDefinitions';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isDefined } from 'twenty-shared/utils';
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
  ] = useAtomComponentState(
    contextStoreCurrentObjectMetadataItemIdComponentState,
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const setCurrentRecordFields = useSetAtomComponentState(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    { objectName: objectNamePlural, objectNameType: 'plural' },
  );

  const { setAvailableFieldDefinitions, setViewObjectMetadataId } =
    useInitViewBar(viewId);

  useEffect(() => {
    if (!isDefined(objectMetadataItem)) {
      return;
    }

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
