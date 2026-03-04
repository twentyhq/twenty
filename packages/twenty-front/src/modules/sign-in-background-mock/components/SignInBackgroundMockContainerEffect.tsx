import { useEffect } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';

import { isActiveFieldMetadataItem } from '@/object-metadata/utils/isActiveFieldMetadataItem';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS } from '@/sign-in-background-mock/constants/SignInBackgroundMockColumnDefinitions';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useInitViewBar } from '@/views/hooks/useInitViewBar';

type SignInBackgroundMockContainerEffectProps = {
  objectNamePlural: string;
  recordTableId: string;
  viewId: string;
};

const MOCK_FIELD_DISPLAY_BY_NAME = new Map(
  SIGN_IN_BACKGROUND_MOCK_COLUMN_DEFINITIONS.map((col) => [
    (col.metadata as { fieldName?: string }).fieldName,
    { size: col.size, position: col.position, isVisible: col.isVisible },
  ]),
);

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

    const recordFields = objectMetadataItem.fields
      .filter((field) =>
        isActiveFieldMetadataItem({
          objectNameSingular: objectMetadataItem.nameSingular,
          fieldMetadata: field,
        }),
      )
      .map((field, index) => {
        const mockDisplay = MOCK_FIELD_DISPLAY_BY_NAME.get(field.name);

        return {
          fieldMetadataItemId: field.id,
          id: field.id,
          isVisible: mockDisplay?.isVisible ?? true,
          position: mockDisplay?.position ?? index,
          size: mockDisplay?.size ?? 100,
        } satisfies RecordField as RecordField;
      });

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
