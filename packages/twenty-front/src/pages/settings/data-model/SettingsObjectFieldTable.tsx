import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { sortedFieldByTableFamilyState } from '@/ui/layout/table/states/sortedFieldByTableFamilyState';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  OBJECT_FIELD_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SettingsObjectFieldItemTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { settingsObjectFieldsFamilyState } from '@/settings/data-model/object-details/states/settingsObjectFieldsFamilyState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { type TableMetadata } from '@/ui/layout/table/types/TableMetadata';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useEffect, useMemo, useState } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconArchive, IconCircleDashed, IconSettings } from 'twenty-ui/icon';
import { SearchInput } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useDefaultViewFieldsLayout } from '@/settings/data-model/object-details/hooks/useDefaultViewFieldsLayout';
import { useMostlyEmptyFieldMetadataIds } from '@/settings/data-model/object-details/hooks/useMostlyEmptyFieldMetadataIds';
import { useMapFieldMetadataItemToSettingsObjectDetailTableItem } from '~/pages/settings/data-model/hooks/useMapFieldMetadataItemToSettingsObjectDetailTableItem';
import { type SettingsObjectDetailTableItem } from '~/pages/settings/data-model/types/SettingsObjectDetailTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledSearchContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const SETTINGS_OBJECT_FIELD_TABLE_METADATA: TableMetadata<SettingsObjectDetailTableItem> =
  {
    tableId: 'settingsObjectDetail',
    fields: [
      {
        fieldLabel: msg`Name`,
        fieldName: 'label',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`App`,
        fieldName: 'fieldType',
        fieldType: 'string',
        align: 'left',
      },
      {
        fieldLabel: msg`Data type`,
        fieldName: 'dataType',
        fieldType: 'string',
        align: 'left',
      },
    ],
  };

export type SettingsObjectFieldTableProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  mode: 'view' | 'new-field';
  excludeRelations?: boolean;
};

// TODO: find another way than using mode which feels like it could be replaced by another pattern
export const SettingsObjectFieldTable = ({
  objectMetadataItem,
  mode,
  excludeRelations = false,
}: SettingsObjectFieldTableProps) => {
  const { t } = useLingui();
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(true);
  const [showSystemFields, setShowSystemFields] = useState(false);
  const [showOnlyMostlyEmpty, setShowOnlyMostlyEmpty] = useState(false);

  const { mostlyEmptyFieldMetadataIds } = useMostlyEmptyFieldMetadataIds({
    objectMetadataItemId: objectMetadataItem.id,
    skip: mode !== 'view',
  });

  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);

  const tableMetadata = SETTINGS_OBJECT_FIELD_TABLE_METADATA;

  const { mapFieldMetadataItemToSettingsObjectDetailTableItem } =
    useMapFieldMetadataItemToSettingsObjectDetailTableItem(objectMetadataItem);

  const settingsObjectFields = useAtomFamilyStateValue(
    settingsObjectFieldsFamilyState,
    { objectMetadataItemId: objectMetadataItem.id },
  );
  const setSettingsObjectFields = useSetAtomFamilyState(
    settingsObjectFieldsFamilyState,
    { objectMetadataItemId: objectMetadataItem.id },
  );

  useEffect(() => {
    setSettingsObjectFields(objectMetadataItem.fields);
  }, [objectMetadataItem, setSettingsObjectFields]);

  const {
    hasEditableDefaultView,
    layoutOrderedFields,
    getEffectiveLayout,
    toggleFieldVisibility,
    reorderFieldFromDropResult,
  } = useDefaultViewFieldsLayout({
    objectMetadataItem,
    fieldMetadataItems: settingsObjectFields ?? [],
  });

  const allObjectSettingsDetailItems = useMemo(() => {
    const filteredBySystem = showSystemFields
      ? layoutOrderedFields
      : layoutOrderedFields.filter(
          (fieldMetadataItem) => !isHiddenSystemField(fieldMetadataItem),
        );

    const fieldsToDisplay = excludeRelations
      ? filteredBySystem.filter(
          (fieldMetadataItem) =>
            fieldMetadataItem.type !== FieldMetadataType.RELATION &&
            fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION,
        )
      : filteredBySystem;

    return fieldsToDisplay.map(
      mapFieldMetadataItemToSettingsObjectDetailTableItem,
    );
  }, [
    layoutOrderedFields,
    mapFieldMetadataItemToSettingsObjectDetailTableItem,
    excludeRelations,
    showSystemFields,
  ]);

  const sortedAllObjectSettingsDetailItems = useSortedArray(
    allObjectSettingsDetailItems,
    tableMetadata,
  );

  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const readonly =
    isObjectMetadataReadOnly({
      objectMetadataItem,
    }) || isDDLLocked;

  const sortedFieldByTable = useAtomFamilyStateValue(
    sortedFieldByTableFamilyState,
    { tableId: tableMetadata.tableId },
  );
  const setSortedFieldByTable = useSetAtomFamilyState(
    sortedFieldByTableFamilyState,
    { tableId: tableMetadata.tableId },
  );

  useEffect(() => {
    setSortedFieldByTable(null);
  }, [setSortedFieldByTable]);

  const filteredItems = useMemo(() => {
    const searchNormalized = normalizeSearchText(searchTerm);

    return sortedAllObjectSettingsDetailItems.filter((item) => {
      const matchesActiveFilter =
        showInactive || item.fieldMetadataItem.isActive;

      const matchesMostlyEmptyFilter =
        !showOnlyMostlyEmpty ||
        mostlyEmptyFieldMetadataIds.has(item.fieldMetadataItem.id);

      const matchesSearch =
        normalizeSearchText(item.label).includes(searchNormalized) ||
        normalizeSearchText(item.dataType).includes(searchNormalized);

      return matchesActiveFilter && matchesMostlyEmptyFilter && matchesSearch;
    });
  }, [
    sortedAllObjectSettingsDetailItems,
    searchTerm,
    showInactive,
    showOnlyMostlyEmpty,
    mostlyEmptyFieldMetadataIds,
  ]);

  const isLayoutEditable =
    mode === 'view' && !readonly && hasEditableDefaultView;

  const isReorderEnabled =
    isLayoutEditable && !isDefined(sortedFieldByTable) && searchTerm === '';

  const handleReorderDragEnd = async (result: DraggableListDropResult) => {
    await reorderFieldFromDropResult({
      dropResult: result,
      visibleFieldMetadataItems: filteredItems.map(
        (tableItem) => tableItem.fieldMetadataItem,
      ),
    });
  };

  const fieldTableRows = filteredItems.map(
    (objectSettingsDetailItem, index) => {
      const fieldMetadataId = objectSettingsDetailItem.fieldMetadataItem.id;
      const isLabelIdentifierField =
        fieldMetadataId === objectMetadataItem.labelIdentifierFieldMetadataId;
      const isLayoutManageableField =
        !isLabelIdentifierField &&
        (objectSettingsDetailItem.fieldMetadataItem.isActive ?? false) &&
        !isHiddenSystemField(objectSettingsDetailItem.fieldMetadataItem);
      const status = objectSettingsDetailItem.fieldMetadataItem.isActive
        ? 'active'
        : 'disabled';

      const row = (
        <SettingsObjectFieldItemTableRow
          key={fieldMetadataId}
          settingsObjectDetailTableItem={objectSettingsDetailItem}
          status={status}
          mode={mode}
          isMostlyEmpty={mostlyEmptyFieldMetadataIds.has(fieldMetadataId)}
          hasDragGripGutter={isReorderEnabled}
          showDragGrip={isReorderEnabled && isLayoutManageableField}
          isVisibleInLayout={
            isLabelIdentifierField ||
            getEffectiveLayout(fieldMetadataId).isVisible
          }
          onToggleVisibility={
            isLayoutEditable && isLayoutManageableField
              ? () => toggleFieldVisibility(fieldMetadataId)
              : undefined
          }
        />
      );

      if (!isReorderEnabled) {
        return row;
      }

      return (
        <DraggableItem
          key={fieldMetadataId}
          draggableId={fieldMetadataId}
          index={index}
          isDragDisabled={!isLayoutManageableField}
          itemComponent={row}
        />
      );
    },
  );

  return (
    <>
      <StyledSearchContainer>
        <SearchInput
          placeholder={t`Search a field...`}
          value={searchTerm}
          onChange={setSearchTerm}
          filterDropdown={(filterButton) => (
            <Dropdown
              dropdownId="settings-fields-filter-dropdown"
              dropdownPlacement="bottom-end"
              dropdownOffset={{ x: 0, y: 8 }}
              clickableComponent={filterButton}
              dropdownComponents={
                <DropdownContent>
                  <DropdownMenuItemsContainer>
                    <MenuItemToggle
                      LeftIcon={IconArchive}
                      onToggleChange={() => setShowInactive(!showInactive)}
                      toggled={showInactive}
                      text={t`Inactive`}
                      toggleSize="small"
                    />
                    {(mostlyEmptyFieldMetadataIds.size > 0 ||
                      showOnlyMostlyEmpty) && (
                      <MenuItemToggle
                        LeftIcon={IconCircleDashed}
                        onToggleChange={() =>
                          setShowOnlyMostlyEmpty(!showOnlyMostlyEmpty)
                        }
                        toggled={showOnlyMostlyEmpty}
                        text={t`Mostly empty`}
                        toggleSize="small"
                      />
                    )}
                    {isAdvancedModeEnabled && (
                      <MenuItemToggle
                        LeftIcon={IconSettings}
                        onToggleChange={() =>
                          setShowSystemFields(!showSystemFields)
                        }
                        toggled={showSystemFields}
                        text={t`System fields`}
                        toggleSize="small"
                      />
                    )}
                  </DropdownMenuItemsContainer>
                </DropdownContent>
              }
            />
          )}
        />
      </StyledSearchContainer>
      <Table>
        <TableRow
          gridTemplateColumns={OBJECT_FIELD_TABLE_ROW_GRID_TEMPLATE_COLUMNS}
        >
          {tableMetadata.fields.map((item) => (
            <SortableTableHeader
              key={item.fieldName}
              fieldName={item.fieldName}
              label={t(item.fieldLabel)}
              tableId={tableMetadata.tableId}
              initialSort={tableMetadata.initialSort}
            />
          ))}
          <TableHeader></TableHeader>
        </TableRow>
        <StyledSettingsDataModelTableBodyContainer>
          <TableBody>
            {isReorderEnabled ? (
              <DraggableList
                onDragEnd={handleReorderDragEnd}
                draggableItems={<>{fieldTableRows}</>}
              />
            ) : (
              fieldTableRows
            )}
          </TableBody>
        </StyledSettingsDataModelTableBodyContainer>
      </Table>
    </>
  );
};
