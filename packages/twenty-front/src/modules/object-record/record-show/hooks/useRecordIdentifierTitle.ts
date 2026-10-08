import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { type GenericFieldContextType } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordImageIdentifierUpload } from '@/object-record/record-show/hooks/useRecordImageIdentifierUpload';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { recordStoreIdentifierFamilySelector } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type UseRecordIdentifierTitleParams = {
  objectNameSingular: string;
  objectRecordId: string;
};

export const useRecordIdentifierTitle = ({
  objectNameSingular,
  objectRecordId,
}: UseRecordIdentifierTitleParams) => {
  const allowRequestsToTwentyIcons = useAtomStateValue(
    allowRequestsToTwentyIconsState,
  );

  const recordIdentifier = useAtomFamilySelectorValue(
    recordStoreIdentifierFamilySelector,
    {
      recordId: objectRecordId,
      allowRequestsToTwentyIcons,
    },
  );

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const { onUploadPicture } = useRecordImageIdentifierUpload({
    objectNameSingular,
    recordId: objectRecordId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({ objectNameSingular });

  const isTitleReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  const titleFieldContextValue: GenericFieldContextType = {
    recordId: objectRecordId,
    isLabelIdentifier: false,
    fieldDefinition: {
      type: labelIdentifierFieldMetadataItem?.type || FieldMetadataType.TEXT,
      iconName: '',
      fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
      label: labelIdentifierFieldMetadataItem?.label || '',
      metadata: {
        fieldName: labelIdentifierFieldMetadataItem?.name || '',
        objectMetadataNameSingular: objectNameSingular,
      },
      defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
    },
    useUpdateRecord: useUpdateOneObjectRecordMutation,
    isCentered: false,
    isDisplayModeFixHeight: true,
    isRecordFieldReadOnly: isTitleReadOnly,
  };

  return {
    recordIdentifier,
    onUploadPicture,
    titleFieldContextValue,
  };
};
