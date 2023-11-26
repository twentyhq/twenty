import { ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { FieldContext } from '@/ui/object/field/contexts/FieldContext';
import { InlineCellHotkeyScope } from '@/ui/object/record-inline-cell/types/InlineCellHotkeyScope';

export const useFieldContext = ({
  objectNameSingular,
  fieldMetadataName,
  objectRecordId,
  fieldPosition,
  forceRefetch,
}: {
  objectNameSingular: string;
  objectRecordId: string;
  fieldMetadataName: string;
  fieldPosition: number;
  forceRefetch?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const fieldMetadataItem = objectMetadataItem?.fields.find(
    (field) => field.name === fieldMetadataName,
  );

  const useUpdateOneObjectMutation: () => [(params: any) => any, any] = () => {
    const { updateOneObject } = useUpdateOneObjectRecord({
      objectNameSingular,
    });

    const updateEntity = ({
      variables,
    }: {
      variables: {
        where: { id: string };
        data: {
          [fieldName: string]: any;
        };
      };
    }) => {
      updateOneObject?.({
        idToUpdate: variables.where.id,
        input: variables.data,
        forceRefetch,
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
              entityId: objectRecordId,
              recoilScopeId: objectRecordId + fieldMetadataItem.id,
              isLabelIdentifier: false,
              fieldDefinition: formatFieldMetadataItemAsColumnDefinition({
                field: fieldMetadataItem,
                position: fieldPosition,
                objectMetadataItem,
              }),
              useUpdateEntityMutation: useUpdateOneObjectMutation,
              hotkeyScope: InlineCellHotkeyScope.InlineCell,
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
