import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconChevronLeft,
  IconChevronRight,
  IconSettings,
  useIcons,
} from 'twenty-ui/display';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

// OMNIA-CUSTOM: Field types that can be displayed as relation sub-field columns
const DISPLAYABLE_SUB_FIELD_TYPES = new Set([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.DATE,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.PHONES,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.LINKS,
  FieldMetadataType.UUID,
]);

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const { objectMetadataItem, recordTableId, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const { changeRecordFieldVisibility } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleAddColumn = useCallback(
    async (
      column: Pick<ColumnDefinition<FieldMetadata>, 'fieldMetadataId'> & {
        subFieldName?: string;
      },
    ) => {
      closeDropdown();
      await changeRecordFieldVisibility({
        ...column,
        isVisible: true,
        subFieldName: column.subFieldName,
      });
    },
    [changeRecordFieldVisibility, closeDropdown],
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  // OMNIA-CUSTOM: Track which relation field is expanded for sub-field selection
  const [expandedRelationFieldId, setExpandedRelationFieldId] = useState<
    string | null
  >(null);

  const { objectMetadataItems } = useObjectMetadataItems();

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItemToFilter) =>
      !visibleRecordFields.some(
        (recordField) =>
          recordField.fieldMetadataItemId === fieldMetadataItemToFilter.id &&
          !recordField.subFieldName,
      ),
  );

  // OMNIA-CUSTOM: Also show already-visible MANY_TO_ONE relations for sub-field expansion
  const visibleRelationFields = activeFieldMetadataItems.filter(
    (field) =>
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type === 'MANY_TO_ONE' &&
      visibleRecordFields.some(
        (rf) => rf.fieldMetadataItemId === field.id && !rf.subFieldName,
      ),
  );

  // OMNIA-CUSTOM: Expanded sub-field view
  if (expandedRelationFieldId) {
    const relationField = activeFieldMetadataItems.find(
      (f) => f.id === expandedRelationFieldId,
    );

    const targetObjectNameSingular =
      relationField?.relation?.targetObjectMetadata?.nameSingular;

    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === targetObjectNameSingular,
    );

    const subFields =
      targetObjectMetadata?.fields.filter(
        (field) =>
          field.isActive &&
          !field.isSystem &&
          DISPLAYABLE_SUB_FIELD_TYPES.has(field.type as FieldMetadataType) &&
          !visibleRecordFields.some(
            (vf) =>
              vf.fieldMetadataItemId === expandedRelationFieldId &&
              vf.subFieldName === field.name,
          ),
      ) ?? [];

    return (
      <DropdownContent>
        <DropdownMenuItemsContainer>
          <MenuItem
            LeftIcon={IconChevronLeft}
            text={relationField?.label ?? 'Back'}
            onClick={() => setExpandedRelationFieldId(null)}
          />
          {subFields.map((subField) => (
            <MenuItem
              key={subField.id}
              LeftIcon={getIcon(subField.icon)}
              text={subField.label}
              onClick={() =>
                handleAddColumn({
                  fieldMetadataId: expandedRelationFieldId,
                  subFieldName: subField.name,
                })
              }
            />
          ))}
        </DropdownMenuItemsContainer>
      </DropdownContent>
    );
  }

  const handleFieldMetadataItemMenuItemClick = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    await handleAddColumn({
      fieldMetadataId: fieldMetadataItem.id,
    });
  };

  return (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        {/* OMNIA-CUSTOM: Show visible relations with expand chevron for sub-fields */}
        {visibleRelationFields.map((fieldMetadataItem) => (
          <MenuItem
            key={`rel-${fieldMetadataItem.id}`}
            LeftIcon={getIcon(fieldMetadataItem.icon)}
            text={`${fieldMetadataItem.label} fields...`}
            onClick={() => setExpandedRelationFieldId(fieldMetadataItem.id)}
            accent="default"
          />
        ))}
        {visibleRelationFields.length > 0 &&
          availableFieldMetadataItemsToShow.length > 0 && (
            <DropdownMenuSeparator />
          )}
        {availableFieldMetadataItemsToShow.map((fieldMetadataItem) => {
          const isManyToOneRelation =
            fieldMetadataItem.type === FieldMetadataType.RELATION &&
            fieldMetadataItem.relation?.type === 'MANY_TO_ONE';

          return (
            <MenuItem
              key={fieldMetadataItem.id}
              onClick={
                isManyToOneRelation
                  ? () => setExpandedRelationFieldId(fieldMetadataItem.id)
                  : () =>
                      handleFieldMetadataItemMenuItemClick(fieldMetadataItem)
              }
              LeftIcon={getIcon(fieldMetadataItem.icon)}
              text={fieldMetadataItem.label}
              RightIcon={isManyToOneRelation ? IconChevronRight : undefined}
            />
          );
        })}
      </DropdownMenuItemsContainer>
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer scrollable={false}>
        <UndecoratedLink
          fullWidth
          to={getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural: objectMetadataItem.namePlural,
          })}
          onClick={() => {
            setNavigationMemorizedUrl(location.pathname + location.search);
          }}
        >
          <MenuItem LeftIcon={IconSettings} text={t`Customize fields`} />
        </UndecoratedLink>
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
