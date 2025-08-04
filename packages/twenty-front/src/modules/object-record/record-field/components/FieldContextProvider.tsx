import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { useIsRecordFieldReadOnly } from '@/object-record/record-field/hooks/read-only/useIsRecordFieldReadOnly';
import { ReactNode } from 'react';

export const FieldContextProvider = ({
  clearable,
  fieldMetadataName,
  fieldPosition,
  isLabelIdentifier = false,
  objectNameSingular,
  objectRecordId,
  customUseUpdateOneObjectHook,
  overridenIsFieldEmpty,
  children,
}: {
  clearable?: boolean;
  fieldMetadataName: string;
  fieldPosition: number;
  isLabelIdentifier?: boolean;
  objectNameSingular: string;
  objectRecordId: string;
  customUseUpdateOneObjectHook?: RecordUpdateHook;
  overridenIsFieldEmpty?: boolean;
  children: ReactNode;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.name === fieldMetadataName,
  );

  const useUpdateOneObjectMutation: RecordUpdateHook = () => {
    const { updateOneRecord } = useUpdateOneRecord({
      objectNameSingular,
    });

    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const isRecordFieldReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: fieldMetadataItem?.id,
    objectMetadataId: objectMetadataItem.id,
  });

  if (!fieldMetadataItem) {
    return null;
  }

  return (
    <FieldContext.Provider
      key={objectRecordId + fieldMetadataItem.id}
      value={{
        recordId: objectRecordId,
        isLabelIdentifier,
        fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
          field: fieldMetadataItem,
          showLabel: true,
          position: fieldPosition,
          objectMetadataItem,
          labelWidth: 90,
        }),
        useUpdateRecord:
          customUseUpdateOneObjectHook ?? useUpdateOneObjectMutation,
        clearable,
        overridenIsFieldEmpty,
        isRecordFieldReadOnly,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
