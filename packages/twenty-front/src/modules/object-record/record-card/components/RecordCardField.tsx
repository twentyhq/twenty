import { isRecordFieldReadOnly } from '@/object-record/read-only/utils/isRecordFieldReadOnly';
import { RecordFieldLookupFieldContext } from '@/object-record/record-column-lookup/components/RecordFieldLookupFieldContext';
import { useGetRecordFieldLookupTarget } from '@/object-record/record-column-lookup/hooks/useGetRecordFieldLookupTarget';
import { getRecordFieldColumnDisplay } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnDisplay';
import { isScopedRelationColumn } from '@/object-record/record-column-scope/utils/isScopedRelationColumn';
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
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { scopeViewFromOwnerViewFieldIdFamilySelector } from '@/views/states/selectors/scopeViewFromOwnerViewFieldIdFamilySelector';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
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
  } = useRecordIndexContextOrThrow();

  const restrictedFieldNames = useRecordRestrictedFieldNames(recordId);

  const getLookupTarget = useGetRecordFieldLookupTarget();

  const isColumnSettingsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_COLUMN_SETTINGS_ENABLED,
  );

  // The card's hover and edit portals find a cell by field, so an added column stays read-only here
  const isAddedColumn = !isCanonicalRecordField(recordField);

  const scopeView = useAtomFamilySelectorValue(
    scopeViewFromOwnerViewFieldIdFamilySelector,
    {
      ownerViewFieldId:
        isColumnSettingsEnabled && isAddedColumn ? recordField.id : '',
    },
  );

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

  const lookupTarget = getLookupTarget({ recordField, fieldMetadataItem });

  const { label } = getRecordFieldColumnDisplay({
    recordField,
    fieldMetadataItem,
    getLookupTarget,
  });

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

  const isScopedColumn =
    isColumnSettingsEnabled &&
    isScopedRelationColumn({ fieldMetadataItem, recordField, scopeView });

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
        scopedRelationViewFieldId: isScopedColumn ? recordField.id : undefined,
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
