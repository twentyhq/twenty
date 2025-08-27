import { type ReactNode } from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordTableContextProvider as RecordTableContextInternalProvider } from '@/object-record/record-table/contexts/RecordTableContext';

import { labelIdentifierFieldMetadataItemSelector } from '@/object-metadata/states/labelIdentifierFieldMetadataItemSelector';
import { formatFieldMetadataItemAsColumnDefinition } from '@/object-metadata/utils/formatFieldMetadataItemAsColumnDefinition';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useRecoilValue } from 'recoil';

type RecordTableContextProviderProps = {
  viewBarId: string;
  recordTableId: string;
  objectNameSingular: string;
  children: ReactNode;
};

export const RecordTableContextProvider = ({
  viewBarId,
  recordTableId,
  objectNameSingular,
  children,
}: RecordTableContextProviderProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
    recordTableId,
  );

  const currentRecordFields = useRecoilComponentValue(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const fieldMetadataItems = objectMetadataItem.fields;

  const fieldMetadataItemByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      fieldMetadataItem,
    ]),
  );

  const recordFieldByFieldMetadataItemId = Object.fromEntries(
    currentRecordFields.map((recordField) => [
      recordField.fieldMetadataItemId,
      recordField,
    ]),
  );

  const fieldDefinitionByFieldMetadataItemId = Object.fromEntries(
    fieldMetadataItems.map((fieldMetadataItem) => [
      fieldMetadataItem.id,
      formatFieldMetadataItemAsColumnDefinition({
        field: fieldMetadataItem,
        objectMetadataItem,
        position:
          recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.position ?? 0,
        labelWidth:
          recordFieldByFieldMetadataItemId[fieldMetadataItem.id]?.size ?? 0,
      }),
    ]),
  );

  const labelIdentifierFieldMetadataItem = useRecoilValue(
    labelIdentifierFieldMetadataItemSelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );

  return (
    <RecordTableContextInternalProvider
      value={{
        viewBarId,
        objectMetadataItem,
        recordTableId,
        objectNameSingular,
        objectPermissions,
        recordFieldByFieldMetadataItemId,
        labelIdentifierFieldMetadataItem,
        visibleRecordFields,
        fieldMetadataItemByFieldMetadataItemId,
        fieldDefinitionByFieldMetadataItemId,
      }}
    >
      {children}
    </RecordTableContextInternalProvider>
  );
};
