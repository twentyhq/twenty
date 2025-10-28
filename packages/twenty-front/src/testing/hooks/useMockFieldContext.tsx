import { type ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import {
  FieldContext,
  type RecordUpdateHook,
} from '@/object-record/record-field/ui/contexts/FieldContext';

export const useMockFieldContext = ({
  clearable,
  fieldMetadataName,
  fieldPosition,
  isLabelIdentifier = false,
  objectNameSingular,
  objectRecordId,
}: {
  clearable?: boolean;
  fieldMetadataName: string;
  fieldPosition: number;
  isLabelIdentifier?: boolean;
  objectNameSingular: string;
  objectRecordId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.name === fieldMetadataName,
  );

  const useUpdateOneObjectMutation: RecordUpdateHook = () => {
    const updateEntity = () => {};

    return [updateEntity, { loading: false }];
  };

  const FieldContextProvider =
    fieldMetadataItem && objectMetadataItem
      ? ({ children }: { children: ReactNode }) => (
          <FieldContext.Provider
            key={objectRecordId + fieldMetadataItem.id}
            value={{
              recordId: objectRecordId,
              isLabelIdentifier,
              fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                field: fieldMetadataItem,
                position: fieldPosition,
                objectMetadataItem,
              }),
              useUpdateRecord: useUpdateOneObjectMutation,
              clearable,
              isRecordFieldReadOnly: false,
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
