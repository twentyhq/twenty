import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { SettingsObjectMetadataItemTableRow } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import {
  SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SETTINGS_OBJECT_TABLE_ROW_MOBILE_MIN_WIDTH,
  StyledStickyFirstCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useContext, useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconArchive, IconChevronRight, IconSettings } from 'twenty-ui/display';
import { SearchInput } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { GET_SETTINGS_OBJECT_TABLE_METADATA } from '~/pages/settings/data-model/constants/SettingsObjectTableMetadata';
import type { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledIconChevronRightContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledSearchInputContainer = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledScrollWrapper = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

const StyledScrollableContent = styled.div`
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    min-width: ${SETTINGS_OBJECT_TABLE_ROW_MOBILE_MIN_WIDTH};
  }
`;

export const SettingsObjectTable = ({
  objectMetadataItems,
  withSearchBar = true,
}: {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  withSearchBar?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);
  const [showSystemObjects, setShowSystemObjects] = useState(false);

  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const { totalCountByObjectMetadataItemNamePlural } =
    useCombinedGetTotalCount();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const installedApplications = currentWorkspace?.installedApplications;

  const allObjectSettingsArray = useMemo(
    () =>
      objectMetadataItems.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel:
              installedApplications?.find(
                (application) =>
                  application.id === objectMetadataItem.applicationId,
              )?.name ?? (objectMetadataItem.isRemote ? 'Remote' : ''),
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !isHiddenSystemField(field),
            ).length,
            totalObjectCount:
              totalCountByObjectMetadataItemNamePlural[
                objectMetadataItem.namePlural
              ] ?? 0,
          }) satisfies SettingsObjectTableItem,
      ),
    [
      objectMetadataItems,
      totalCountByObjectMetadataItemNamePlural,
      installedApplications,
    ],
  );

  const sortedObjectSettingsItems = useSortedArray(
    allObjectSettingsArray,
    GET_SETTINGS_OBJECT_TABLE_METADATA,
  );

  const filteredObjectSettingsItems = useMemo(
    () =>
      sortedObjectSettingsItems.filter((item) => {
        const searchNormalized = normalizeSearchText(searchTerm);
        const matchesSearch =
          normalizeSearchText(item.labelPlural).includes(searchNormalized) ||
          normalizeSearchText(item.objectTypeLabel).includes(searchNormalized);

        if (!matchesSearch) {
          return false;
        }

        const isActive = item.objectMetadataItem.isActive;
        if (!isActive && !showDeactivated) {
          return false;
        }

        const isSystem = item.objectMetadataItem.isSystem;
        if (isSystem && !showSystemObjects) {
          return false;
        }

        return true;
      }),
    [sortedObjectSettingsItems, searchTerm, showDeactivated, showSystemObjects],
  );

  return (
    <>
      {withSearchBar && (
        <StyledSearchInputContainer>
          <SearchInput
            placeholder={t`Search for an object...`}
            value={searchTerm}
            onChange={setSearchTerm}
            filterDropdown={(filterButton: ReactNode) => (
              <Dropdown
                dropdownId="settings-objects-filter-dropdown"
                dropdownPlacement="bottom-end"
                dropdownOffset={{ x: 0, y: 8 }}
                clickableComponent={filterButton}
                dropdownComponents={
                  <DropdownContent>
                    <DropdownMenuItemsContainer>
                      <MenuItemToggle
                        LeftIcon={IconArchive}
                        onToggleChange={() =>
                          setShowDeactivated(!showDeactivated)
                        }
                        toggled={showDeactivated}
                        text={t`Deactivated`}
                        toggleSize="small"
                      />
                      {isAdvancedModeEnabled && (
                        <MenuItemToggle
                          LeftIcon={IconSettings}
                          onToggleChange={() =>
                            setShowSystemObjects(!showSystemObjects)
                          }
                          toggled={showSystemObjects}
                          text={t`System objects`}
                          toggleSize="small"
                        />
                      )}
                    </DropdownMenuItemsContainer>
                  </DropdownContent>
                }
              />
            )}
          />
        </StyledSearchInputContainer>
      )}

      <StyledScrollWrapper>
        <StyledScrollableContent>
          <Table>
            <TableRow
              gridTemplateColumns={
                SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS
              }
            >
              {GET_SETTINGS_OBJECT_TABLE_METADATA.fields.map(
                (settingsObjectsTableMetadataField, index) =>
                  index === 0 ? (
                    <StyledStickyFirstCell
                      key={settingsObjectsTableMetadataField.fieldName}
                    >
                      <SortableTableHeader
                        fieldName={settingsObjectsTableMetadataField.fieldName}
                        label={t(settingsObjectsTableMetadataField.fieldLabel)}
                        tableId={GET_SETTINGS_OBJECT_TABLE_METADATA.tableId}
                        align={settingsObjectsTableMetadataField.align}
                        initialSort={
                          GET_SETTINGS_OBJECT_TABLE_METADATA.initialSort
                        }
                      />
                    </StyledStickyFirstCell>
                  ) : (
                    <SortableTableHeader
                      key={settingsObjectsTableMetadataField.fieldName}
                      fieldName={settingsObjectsTableMetadataField.fieldName}
                      label={t(settingsObjectsTableMetadataField.fieldLabel)}
                      tableId={GET_SETTINGS_OBJECT_TABLE_METADATA.tableId}
                      align={settingsObjectsTableMetadataField.align}
                      initialSort={
                        GET_SETTINGS_OBJECT_TABLE_METADATA.initialSort
                      }
                    />
                  ),
              )}
              <TableHeader></TableHeader>
            </TableRow>
            {filteredObjectSettingsItems.map((objectSettingsItem) => {
              const isActive = objectSettingsItem.objectMetadataItem.isActive;

              return (
                <SettingsObjectMetadataItemTableRow
                  key={objectSettingsItem.objectMetadataItem.namePlural}
                  objectMetadataItem={objectSettingsItem.objectMetadataItem}
                  totalObjectCount={objectSettingsItem.totalObjectCount}
                  action={
                    isActive ? (
                      <StyledIconChevronRightContainer>
                        <IconChevronRight
                          size={theme.icon.size.md}
                          stroke={theme.icon.stroke.sm}
                        />
                      </StyledIconChevronRightContainer>
                    ) : isDDLLocked ? null : (
                      <SettingsObjectInactiveMenuDropDown
                        isCustomObject={
                          objectSettingsItem.objectMetadataItem.isCustom
                        }
                        objectMetadataItemNamePlural={
                          objectSettingsItem.objectMetadataItem.namePlural
                        }
                        onActivate={() =>
                          updateOneObjectMetadataItem({
                            idToUpdate:
                              objectSettingsItem.objectMetadataItem.id,
                            updatePayload: { isActive: true },
                          })
                        }
                        onDelete={() =>
                          deleteOneObjectMetadataItem(
                            objectSettingsItem.objectMetadataItem.id,
                          )
                        }
                      />
                    )
                  }
                  link={
                    isActive
                      ? getSettingsPath(SettingsPath.ObjectDetail, {
                          objectNamePlural:
                            objectSettingsItem.objectMetadataItem.namePlural,
                        })
                      : undefined
                  }
                />
              );
            })}
          </Table>
        </StyledScrollableContent>
      </StyledScrollWrapper>
    </>
  );
};
