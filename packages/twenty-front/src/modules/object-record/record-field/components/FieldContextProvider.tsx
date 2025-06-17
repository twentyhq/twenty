import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
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

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

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

  if (!fieldMetadataItem) {
    return null;
  }

  const isObjectReadOnly = !objectPermissions.canUpdateObjectRecords;

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
        isReadOnly: isObjectReadOnly,
      }}
    >
      {children}
    </FieldContext.Provider>
  );
};
