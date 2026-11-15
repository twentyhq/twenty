import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordFieldLookupFieldContext';
import { ScopedRelationAliasesContext } from '@/object-record/record-column-scope/contexts/ScopedRelationAliasesContext';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import {
  FieldContext,
  type RecordUpdateHook,
} from '@/object-record/record-field/ui/contexts/FieldContext';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import { isCanonicalRecordField } from '@/object-record/record-field/utils/isCanonicalRecordField';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { useRecordRestrictedFieldNames } from '@/object-record/record-store/hooks/useRecordRestrictedFieldNames';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

type RecordCardFieldProps = {
  recordField: RecordField;
  recordId: string;
  isRecordReadOnly: boolean;
  cardInstanceIdPrefix: string;
  useUpdateRecord: RecordUpdateHook;
  onMouseEnter: () => void;
  hasAnchor?: boolean;
};

export const RecordCardField = ({
  recordField,
  recordId,
  isRecordReadOnly,
  cardInstanceIdPrefix,
  useUpdateRecord,
  onMouseEnter,
  hasAnchor = true,
}: RecordCardFieldProps) => {
  const {
    objectMetadataItem,
    fieldMetadataItemByFieldMetadataItemId,
    fieldDefinitionByFieldMetadataItemId,
    objectPermissionsByObjectMetadataId,
    columnDescriptorByRecordFieldId,
  } = useRecordIndexContextOrThrow();

  const restrictedFieldNames = useRecordRestrictedFieldNames(recordId);

  // The card's hover and edit portals find a cell by field, so an added column stays read-only here
  const isAddedColumn = !isCanonicalRecordField(recordField);

  const scopedRelationAlias = useContext(ScopedRelationAliasesContext).find(
    ({ ownerViewFieldId }) => ownerViewFieldId === recordField.id,
  );

  const columnDescriptor = columnDescriptorByRecordFieldId[recordField.id];

  const fieldDefinition =
    fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];
  const fieldMetadataItem =
    fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId];

  if (!isDefined(fieldDefinition) || !isDefined(fieldMetadataItem)) {
    return null;
  }

  // An added column shares its field with the canonical one, so it needs its own editor and anchor ids
  const fieldInstanceIdPrefix = isAddedColumn
    ? `${cardInstanceIdPrefix}-${recordField.id}`
    : cardInstanceIdPrefix;

  const anchorId = hasAnchor
    ? `${fieldInstanceIdPrefix}-${recordId}-${fieldDefinition.metadata.fieldName}`
    : undefined;

  const lookupTarget = columnDescriptor?.lookupTarget;
  const label = columnDescriptor?.label ?? fieldDefinition.label;

  if (isDefined(lookupTarget)) {
    // Two cards can show the same related record, so the cell instance is keyed by the card's record too
    const lookupInstanceIdPrefix = `${fieldInstanceIdPrefix}-${recordId}`;

    return (
      <RecordFieldLookupFieldContext
        recordId={recordId}
        fieldMetadataItem={fieldMetadataItem}
        relationObjectMetadataItem={lookupTarget.relationObjectMetadataItem}
        lookupTargetFieldMetadataItem={
          lookupTarget.lookupTargetFieldMetadataItem
        }
        instanceIdPrefix={lookupInstanceIdPrefix}
        isNonEditable
        label={label}
        maxWidth={156}
        isDisplayModeFixHeight
        triggerEvent="CLICK"
        anchorId={anchorId}
        onOpenEditMode={() => undefined}
      >
        <RecordInlineCell instanceIdPrefix={lookupInstanceIdPrefix} />
      </RecordFieldLookupFieldContext>
    );
  }

  const isFieldRestricted = restrictedFieldNames.includes(
    fieldMetadataItem.name,
  );

  return (
    <FieldContext.Provider
      value={{
        recordId,
        maxWidth: 156,
        isLabelIdentifier: false,
        isForbidden: isFieldRestricted,
        isRecordFieldReadOnly:
          isAddedColumn ||
          isFieldRestricted ||
          isRecordFieldReadOnly({
            isRecordReadOnly,
            objectMetadataId: objectMetadataItem.id,
            fieldMetadataItem,
            fieldDefinition,
            objectPermissionsByObjectMetadataId,
          }),
        fieldDefinition: { ...fieldDefinition, label },
        useUpdateRecord,
        isDisplayModeFixHeight: true,
        triggerEvent: 'CLICK',
        anchorId,
        fieldValueKey: scopedRelationAlias?.alias,
        prefillRecordFilters: scopedRelationAlias?.prefillRecordFilters,
        onMouseEnter: isAddedColumn ? undefined : onMouseEnter,
        onOpenEditMode: isAddedColumn ? () => undefined : undefined,
      }}
    >
      <RecordFieldComponentInstanceContext.Provider
        value={{
          instanceId: getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix: fieldInstanceIdPrefix,
          }),
        }}
      >
        <RecordInlineCell instanceIdPrefix={fieldInstanceIdPrefix} />
      </RecordFieldComponentInstanceContext.Provider>
    </FieldContext.Provider>
  );
};
