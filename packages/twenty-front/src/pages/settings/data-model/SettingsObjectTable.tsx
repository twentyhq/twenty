import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import {
  SettingsObjectMetadataItemTableRow,
  StyledObjectTableRow,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  IconArchive,
  IconChevronRight,
  IconFilter,
  IconSearch,
  IconSettings,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { MenuItemToggle } from 'twenty-ui/navigation';
import { GET_SETTINGS_OBJECT_TABLE_METADATA } from '~/pages/settings/data-model/constants/SettingsObjectTableMetadata';
import type { SettingsObjectTableItem } from '~/pages/settings/data-model/types/SettingsObjectTableItem';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledIconChevronRight = styled(IconChevronRight)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSearchAndFilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  align-items: center;
  padding-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledSearchInput = styled(SettingsTextInput)`
  flex: 1;
  width: 100%;
`;

export const SettingsObjectTable = ({
  objectMetadataItems,
  withSearchBar = true,
}: {
  objectMetadataItems: ObjectMetadataItem[];
  withSearchBar?: boolean;
}) => {
  const { t } = useLingui();

  const theme = useTheme();

  const isAdvancedModeEnabled = useRecoilValue(isAdvancedModeEnabledState);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);
  const [showSystemObjects, setShowSystemObjects] = useState(false);

  const { deleteOneObjectMetadataItem } = useDeleteOneObjectMetadataItem();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const { totalCountByObjectMetadataItemNamePlural } = useCombinedGetTotalCount(
    {
      objectMetadataItems,
    },
  );

  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const allObjectSettingsArray = useMemo(
    () =>
      objectMetadataItems.map(
        (objectMetadataItem) =>
          ({
            objectMetadataItem,
            labelPlural: objectMetadataItem.labelPlural,
            objectTypeLabel: getItemTagInfo({
              item: objectMetadataItem,
              workspaceCustomApplicationId:
                currentWorkspace?.workspaceCustomApplication?.id,
            }).labelText,
            fieldsCount: objectMetadataItem.fields.filter(
              (field) => !field.isSystem,
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
      currentWorkspace,
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
        <StyledSearchAndFilterContainer>
          <StyledSearchInput
            instanceId="settings-objects-search"
            LeftIcon={IconSearch}
            placeholder={t`Search for an object...`}
            value={searchTerm}
            onChange={setSearchTerm}
          />
          <Dropdown
            dropdownId="settings-objects-filter-dropdown"
            dropdownPlacement="bottom-end"
            dropdownOffset={{ x: 0, y: 8 }}
            clickableComponent={
              <Button
                Icon={IconFilter}
                size="medium"
                variant="secondary"
                accent="default"
                ariaLabel={t`Filter`}
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItemToggle
                    LeftIcon={IconArchive}
                    onToggleChange={() => setShowDeactivated(!showDeactivated)}
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
        </StyledSearchAndFilterContainer>
      )}

      <Table>
        <StyledObjectTableRow>
          {GET_SETTINGS_OBJECT_TABLE_METADATA.fields.map(
            (settingsObjectsTableMetadataField) => (
              <SortableTableHeader
                key={settingsObjectsTableMetadataField.fieldName}
                fieldName={settingsObjectsTableMetadataField.fieldName}
                label={t(settingsObjectsTableMetadataField.fieldLabel)}
                tableId={GET_SETTINGS_OBJECT_TABLE_METADATA.tableId}
                align={settingsObjectsTableMetadataField.align}
                initialSort={GET_SETTINGS_OBJECT_TABLE_METADATA.initialSort}
              />
            ),
          )}
          <TableHeader></TableHeader>
        </StyledObjectTableRow>
        {filteredObjectSettingsItems.map((objectSettingsItem) => {
          const isActive = objectSettingsItem.objectMetadataItem.isActive;

          return (
            <SettingsObjectMetadataItemTableRow
              key={objectSettingsItem.objectMetadataItem.namePlural}
              objectMetadataItem={objectSettingsItem.objectMetadataItem}
              totalObjectCount={objectSettingsItem.totalObjectCount}
              action={
                isActive ? (
                  <StyledIconChevronRight
                    size={theme.icon.size.md}
                    stroke={theme.icon.stroke.sm}
                  />
                ) : (
                  <SettingsObjectInactiveMenuDropDown
                    isCustomObject={
                      objectSettingsItem.objectMetadataItem.isCustom
                    }
                    objectMetadataItemNamePlural={
                      objectSettingsItem.objectMetadataItem.namePlural
                    }
                    onActivate={() =>
                      updateOneObjectMetadataItem({
                        idToUpdate: objectSettingsItem.objectMetadataItem.id,
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
    </>
  );
};
