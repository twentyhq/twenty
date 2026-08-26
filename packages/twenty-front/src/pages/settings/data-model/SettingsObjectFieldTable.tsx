import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { isObjectMetadataReadOnly } from '@/object-record/read-only/utils/isObjectMetadataReadOnly';
import { computeFieldMetadataLayoutPositionUpdates } from '@/settings/data-model/object-details/utils/computeFieldMetadataLayoutPositionUpdates';
import { sortFieldMetadataItemsByViewLayout } from '@/settings/data-model/object-details/utils/sortFieldMetadataItemsByViewLayout';
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
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useViewOrDefaultView } from '@/views/hooks/useViewOrDefaultView';
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
import { v4 } from 'uuid';
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

type PendingViewFieldLayout = {
  position?: number;
  isVisible?: boolean;
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

  const { view: indexView } = useViewOrDefaultView({
    objectMetadataItemId: objectMetadataItem.id,
  });

  const { performViewFieldAPICreate, performViewFieldAPIUpdate } =
    usePerformViewFieldAPIPersist();

  // Overlay applied while viewField writes are in flight, so rows do not snap
  // back before the view state carries the persisted values.
  const [pendingLayoutByFieldMetadataId, setPendingLayoutByFieldMetadataId] =
    useState<Map<string, PendingViewFieldLayout>>(new Map());

  const viewFieldByFieldMetadataId = useMemo(
    () =>
      new Map(
        (indexView?.viewFields ?? []).map((viewField) => [
          viewField.fieldMetadataId,
          viewField,
        ]),
      ),
    [indexView],
  );

  const getEffectiveLayout = (
    fieldMetadataId: string,
  ): { position: number | null; isVisible: boolean } => {
    const pending = pendingLayoutByFieldMetadataId.get(fieldMetadataId);
    const viewField = viewFieldByFieldMetadataId.get(fieldMetadataId);

    return {
      position: pending?.position ?? viewField?.position ?? null,
      isVisible: pending?.isVisible ?? viewField?.isVisible ?? false,
    };
  };

  const positionByFieldMetadataId = useMemo(() => {
    const positions = new Map<string, number>();

    for (const field of settingsObjectFields ?? []) {
      const pending = pendingLayoutByFieldMetadataId.get(field.id);
      const viewField = viewFieldByFieldMetadataId.get(field.id);
      const position = pending?.position ?? viewField?.position;

      if (isDefined(position)) {
        positions.set(field.id, position);
      }
    }

    return positions;
  }, [
    settingsObjectFields,
    pendingLayoutByFieldMetadataId,
    viewFieldByFieldMetadataId,
  ]);

  const layoutOrderedFields = useMemo(
    () =>
      sortFieldMetadataItemsByViewLayout({
        fieldMetadataItems: settingsObjectFields ?? [],
        positionByFieldMetadataId,
      }),
    [settingsObjectFields, positionByFieldMetadataId],
  );

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

  const isLayoutEditable = mode === 'view' && !readonly && isDefined(indexView);

  const isReorderEnabled =
    isLayoutEditable && !isDefined(sortedFieldByTable) && searchTerm === '';

  const persistLayoutUpdates = async (
    layoutUpdates: {
      fieldMetadataId: string;
      layout: PendingViewFieldLayout;
    }[],
  ) => {
    if (!isDefined(indexView)) {
      return;
    }

    setPendingLayoutByFieldMetadataId((previousPending) => {
      const newPending = new Map(previousPending);

      for (const { fieldMetadataId, layout } of layoutUpdates) {
        newPending.set(fieldMetadataId, {
          ...newPending.get(fieldMetadataId),
          ...layout,
        });
      }

      return newPending;
    });

    const viewFieldsToCreate = [];
    const viewFieldsToUpdate = [];

    for (const { fieldMetadataId, layout } of layoutUpdates) {
      const existingViewField = viewFieldByFieldMetadataId.get(fieldMetadataId);

      if (isDefined(existingViewField)) {
        viewFieldsToUpdate.push({
          input: {
            id: existingViewField.id,
            update: {
              ...(isDefined(layout.position)
                ? { position: layout.position }
                : {}),
              ...(isDefined(layout.isVisible)
                ? { isVisible: layout.isVisible }
                : {}),
            },
          },
        });
      } else {
        viewFieldsToCreate.push({
          id: v4(),
          viewId: indexView.id,
          fieldMetadataId,
          position:
            layout.position ??
            getEffectiveLayout(fieldMetadataId).position ??
            0,
          isVisible: layout.isVisible ?? false,
        });
      }
    }

    try {
      if (viewFieldsToCreate.length > 0) {
        await performViewFieldAPICreate({ inputs: viewFieldsToCreate });
      }
      if (viewFieldsToUpdate.length > 0) {
        await performViewFieldAPIUpdate(viewFieldsToUpdate);
      }
    } finally {
      setPendingLayoutByFieldMetadataId((previousPending) => {
        const newPending = new Map(previousPending);

        for (const { fieldMetadataId } of layoutUpdates) {
          newPending.delete(fieldMetadataId);
        }

        return newPending;
      });
    }
  };

  const handleToggleFieldVisibility = async (fieldMetadataId: string) => {
    const { isVisible } = getEffectiveLayout(fieldMetadataId);

    await persistLayoutUpdates([
      { fieldMetadataId, layout: { isVisible: !isVisible } },
    ]);
  };

  const handleReorderDragEnd = async (result: DraggableListDropResult) => {
    if (!isDefined(result.destination)) {
      return;
    }

    const visibleFields = filteredItems.map(
      (tableItem) => tableItem.fieldMetadataItem,
    );
    const movedField = visibleFields[result.source.index];

    if (!isDefined(movedField)) {
      return;
    }

    const visibleFieldsWithoutMoved = visibleFields.filter(
      (field) => field.id !== movedField.id,
    );
    const precedingField =
      result.destination.index === 0
        ? null
        : (visibleFieldsWithoutMoved[result.destination.index - 1] ?? null);

    const positionUpdates = computeFieldMetadataLayoutPositionUpdates({
      orderedFieldMetadataItems: layoutOrderedFields.map((field) => ({
        id: field.id,
        position: positionByFieldMetadataId.get(field.id) ?? null,
      })),
      movedFieldMetadataId: movedField.id,
      precedingFieldMetadataId: precedingField?.id ?? null,
    });

    if (positionUpdates.length === 0) {
      return;
    }

    await persistLayoutUpdates(
      positionUpdates.map((update) => ({
        fieldMetadataId: update.fieldMetadataId,
        layout: { position: update.position },
      })),
    );
  };

  const fieldTableRows = filteredItems.map(
    (objectSettingsDetailItem, index) => {
      const fieldMetadataId = objectSettingsDetailItem.fieldMetadataItem.id;
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
          showDragGrip={isReorderEnabled}
          isVisibleInLayout={getEffectiveLayout(fieldMetadataId).isVisible}
          onToggleVisibility={
            isLayoutEditable
              ? () => handleToggleFieldVisibility(fieldMetadataId)
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
