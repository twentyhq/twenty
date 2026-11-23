import { findCanonicalRecordField } from '@/object-record/record-field/utils/findCanonicalRecordField';
import { RecordTableLookupTargetFieldSelectMenu } from '@/object-record/record-column-lookup/components/RecordTableLookupTargetFieldSelectMenu';
import { RecordTableScopedRelationColumnSelectMenu } from '@/object-record/record-column-scope/components/RecordTableScopedRelationColumnSelectMenu';
import { resolveScopableRelation } from '@/object-record/record-column-scope/utils/resolveScopableRelation';
import { useCanAddRecordTableLookupColumns } from '@/object-record/record-table/hooks/useCanAddRecordTableLookupColumns';
import { isPlainManyToOneRelationField } from '@/object-record/utils/isPlainManyToOneRelationField';
import { useOpenEditColumnInSidePanel } from '@/side-panel/hooks/useOpenEditColumnInSidePanel';
import { useActiveFieldMetadataItems } from '@/object-metadata/hooks/useActiveFieldMetadataItems';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useChangeRecordFieldVisibility } from '@/object-record/record-field/hooks/useChangeRecordFieldVisibility';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSettings } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';

export const RecordTableHeaderPlusButtonContent = () => {
  const { t } = useLingui();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem, recordTableId, visibleRecordFields } =
    useRecordTableContextOrThrow();

  const { getIcon } = useIcons();

  const { changeRecordFieldVisibility, addLookupRecordField } =
    useChangeRecordFieldVisibility(recordTableId);

  const handleAddColumn = useCallback(
    async (
      column: Pick<ColumnDefinition<FieldMetadata>, 'fieldMetadataId'>,
    ) => {
      await changeRecordFieldVisibility({ ...column, isVisible: true });
    },
    [changeRecordFieldVisibility],
  );

  const location = useLocation();
  const setNavigationMemorizedUrl = useSetAtomState(
    navigationMemorizedUrlState,
  );

  const { activeFieldMetadataItems } = useActiveFieldMetadataItems({
    objectMetadataItem,
  });

  const canAddLookupColumns = useCanAddRecordTableLookupColumns();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { openEditColumnInSidePanel } =
    useOpenEditColumnInSidePanel(recordTableId);

  const isFieldVisible = (fieldMetadataItem: FieldMetadataItem) =>
    isDefined(
      findCanonicalRecordField({
        recordFields: visibleRecordFields,
        fieldMetadataItemId: fieldMetadataItem.id,
      }),
    );

  // A many-to-one relation stays listed once shown, to reach its lookup columns
  const isLookupRelation = (fieldMetadataItem: FieldMetadataItem) =>
    canAddLookupColumns && isPlainManyToOneRelationField(fieldMetadataItem);

  // A one-to-many relation stays listed once shown, to reach its filtered columns
  const isScopedRelation = (fieldMetadataItem: FieldMetadataItem) =>
    canAddLookupColumns &&
    isDefined(
      resolveScopableRelation({ fieldMetadataItem, objectMetadataItems }),
    );

  const hasSubPage = (fieldMetadataItem: FieldMetadataItem) =>
    isLookupRelation(fieldMetadataItem) || isScopedRelation(fieldMetadataItem);

  const availableFieldMetadataItemsToShow = activeFieldMetadataItems.filter(
    (fieldMetadataItem) =>
      !isFieldVisible(fieldMetadataItem) || hasSubPage(fieldMetadataItem),
  );

  const lookupRelationFieldMetadataItems =
    availableFieldMetadataItemsToShow.filter(isLookupRelation);

  const scopedRelationFieldMetadataItems =
    availableFieldMetadataItemsToShow.filter(isScopedRelation);

  const filteredFieldMetadataItems = availableFieldMetadataItemsToShow.filter(
    (fieldMetadataItem) => {
      return fieldMetadataItem.label
        .toLowerCase()
        .includes(searchInput.toLowerCase());
    },
  );

  const handleFieldMetadataItemMenuItemClick = async (
    fieldMetadataItem: FieldMetadataItem,
  ) => {
    await handleAddColumn({
      fieldMetadataId: fieldMetadataItem.id,
    });
  };

  const hasAvailableFields = isNonEmptyArray(availableFieldMetadataItemsToShow);

  return (
    <>
      <Dropdown.Page id="root">
        {hasAvailableFields && (
          <>
            <Dropdown.Search
              value={searchInput}
              placeholder={t`Search fields`}
              aria-label={t`Search fields`}
              onValueChange={setSearchInput}
            />
            <Dropdown.Separator />
          </>
        )}
        <Dropdown.Section scrollable>
          {isNonEmptyArray(filteredFieldMetadataItems) ? (
            filteredFieldMetadataItems.map((fieldMetadataItem) => {
              const startIcon = (
                <SelectOptionIcon Icon={getIcon(fieldMetadataItem.icon)} />
              );

              return hasSubPage(fieldMetadataItem) ? (
                <Dropdown.ActionItem
                  key={fieldMetadataItem.id}
                  page={fieldMetadataItem.id}
                  startIcon={startIcon}
                >
                  {fieldMetadataItem.label}
                </Dropdown.ActionItem>
              ) : (
                <Dropdown.OptionItem
                  key={fieldMetadataItem.id}
                  onSelect={() =>
                    handleFieldMetadataItemMenuItemClick(fieldMetadataItem)
                  }
                  startIcon={startIcon}
                >
                  {fieldMetadataItem.label}
                </Dropdown.OptionItem>
              );
            })
          ) : (
            <Dropdown.Empty>
              {hasAvailableFields
                ? t`No results`
                : t`All fields are already visible`}
            </Dropdown.Empty>
          )}
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Section scrollable={false}>
          <Dropdown.ActionItem
            render={
              <Link
                to={getSettingsPath(SettingsPath.ObjectDetail, {
                  objectNamePlural: objectMetadataItem.namePlural,
                })}
              />
            }
            onClick={() => {
              setNavigationMemorizedUrl(location.pathname + location.search);
            }}
            startIcon={<IconSettings />}
          >{t`Customize fields`}</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Page>
      {lookupRelationFieldMetadataItems.map((relationFieldMetadataItem) => (
        <Dropdown.Page
          key={relationFieldMetadataItem.id}
          id={relationFieldMetadataItem.id}
        >
          <RecordTableLookupTargetFieldSelectMenu
            relationFieldMetadataItem={relationFieldMetadataItem}
            onSelect={(lookupTargetFieldMetadataItem) =>
              addLookupRecordField({
                fieldMetadataId: relationFieldMetadataItem.id,
                relationTargetFieldMetadataId: lookupTargetFieldMetadataItem.id,
              })
            }
          >
            {!isFieldVisible(relationFieldMetadataItem) && (
              <>
                <Dropdown.Section scrollable={false}>
                  <Dropdown.ActionItem
                    onClick={() =>
                      handleFieldMetadataItemMenuItemClick(
                        relationFieldMetadataItem,
                      )
                    }
                    startIcon={
                      <SelectOptionIcon
                        Icon={getIcon(relationFieldMetadataItem.icon)}
                      />
                    }
                  >
                    {relationFieldMetadataItem.label}
                  </Dropdown.ActionItem>
                </Dropdown.Section>
                <Dropdown.Separator />
              </>
            )}
          </RecordTableLookupTargetFieldSelectMenu>
        </Dropdown.Page>
      ))}
      {scopedRelationFieldMetadataItems.map((relationFieldMetadataItem) => (
        <Dropdown.Page
          key={relationFieldMetadataItem.id}
          id={relationFieldMetadataItem.id}
        >
          <RecordTableScopedRelationColumnSelectMenu
            relationFieldMetadataItem={relationFieldMetadataItem}
            onPlainColumnSelect={
              isFieldVisible(relationFieldMetadataItem)
                ? undefined
                : () =>
                    handleFieldMetadataItemMenuItemClick(
                      relationFieldMetadataItem,
                    )
            }
            onScopedColumnSelect={() =>
              openEditColumnInSidePanel({
                fieldMetadataItemId: relationFieldMetadataItem.id,
              })
            }
          />
        </Dropdown.Page>
      ))}
    </>
  );
};
