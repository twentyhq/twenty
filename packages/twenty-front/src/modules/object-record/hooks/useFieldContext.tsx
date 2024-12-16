import { ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';

export const useFieldContext = ({
  clearable,
  fieldMetadataName,
  fieldPosition,
  isLabelIdentifier = false,
  objectNameSingular,
  objectRecordId,
  customUseUpdateOneObjectHook,
  overridenIsFieldEmpty,
}: {
  clearable?: boolean;
  fieldMetadataName: string;
  fieldPosition: number;
  isLabelIdentifier?: boolean;
  objectNameSingular: string;
  objectRecordId: string;
  customUseUpdateOneObjectHook?: RecordUpdateHook;
  overridenIsFieldEmpty?: boolean;
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

  const FieldContextProvider =
    fieldMetadataItem && objectMetadataItem
      ? ({ children }: { children: ReactNode }) => (
          <FieldContext.Provider
            key={objectRecordId + fieldMetadataItem.id}
            value={{
              recordId: objectRecordId,
              recoilScopeId: objectRecordId + fieldMetadataItem.id,
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
              hotkeyScope: InlineCellHotkeyScope.InlineCell,
              clearable,
              overridenIsFieldEmpty,
            }}
          >
            {children}
          </FieldContext.Provider>
        )
      : undefined;

  return {
    FieldContextProvider,
  };
};
