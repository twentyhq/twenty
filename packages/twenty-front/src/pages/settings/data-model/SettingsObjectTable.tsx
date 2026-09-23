import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isDDLLockedState } from '@/client-config/states/isDDLLockedState';
import { useDeleteOneObjectMetadataItem } from '@/object-metadata/hooks/useDeleteOneObjectMetadataItem';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';
import { useCombinedGetTotalCount } from '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount';
import { StyledSettingsDataModelTableBodyContainer } from '@/settings/data-model/components/SettingsDataModelTableBodyContainer';
import { SettingsObjectMetadataItemTableRow } from '@/settings/data-model/object-details/components/SettingsObjectItemTableRow';
import {
  SETTINGS_OBJECT_TABLE_ROW_GRID_TEMPLATE_COLUMNS,
  SETTINGS_OBJECT_TABLE_ROW_MOBILE_MIN_WIDTH,
  StyledStickyFirstCell,
} from '@/settings/data-model/object-details/components/SettingsObjectItemTableRowStyledComponents';
import { SettingsObjectInactiveMenuDropDown } from '@/settings/data-model/objects/components/SettingsObjectInactiveMenuDropDown';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { SortableTableHeader } from '@/ui/layout/table/components/SortableTableHeader';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useSortedArray } from '@/ui/layout/table/hooks/useSortedArray';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { ClickOutsideListenerContext } from '@/ui/utilities/pointer-event/contexts/ClickOutsideListenerContext';
import { ParentClickOutsideIdContext } from '@/ui/utilities/pointer-event/contexts/ParentClickOutsideIdContext';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext, useMemo, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Dropdown, SearchInput, SettingsRow } from 'twenty-ui/components';
import { IconArchive, IconChevronRight, IconSettings } from 'twenty-ui/icon';
import {
  MOBILE_VIEWPORT,
  ThemeContext,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
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
  const { excludedClickOutsideId } = useContext(ClickOutsideListenerContext);
  const parentClickOutsideId = useContext(ParentClickOutsideIdContext);

  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const navigate = useNavigateSettings();

  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const isDDLLocked = useAtomStateValue(isDDLLockedState);

  const [searchTerm, setSearchTerm] = useState('');
  const [showDeactivated, setShowDeactivated] = useState(true);
  const [showSystemObjects, setShowSystemObjects] = useState(true);
  const shouldShowSystemObjects = isAdvancedModeEnabled && showSystemObjects;

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
        if (isSystem && !shouldShowSystemObjects) {
          return false;
        }

        return true;
      }),
    [
      sortedObjectSettingsItems,
      searchTerm,
      showDeactivated,
      shouldShowSystemObjects,
    ],
  );

  return (
    <>
      {withSearchBar && (
        <StyledSearchInputContainer>
          <SearchInput
            placeholder={t`Search for an object...`}
            value={searchTerm}
            onChange={setSearchTerm}
            filterDropdown={(filterButton) => (
              <DropdownRoot
                dropdownId="settings-objects-filter-dropdown"
                type="panel"
              >
                <Dropdown.Trigger render={filterButton} />
                <Dropdown.Content
                  side="bottom"
                  align="end"
                  sideOffset={8}
                  alignOffset={0}
                  data-click-outside-id={excludedClickOutsideId}
                >
                  <div data-click-outside-id={parentClickOutsideId}>
                    <Dropdown.Section>
                      <SettingsRow
                        startIcon={<IconArchive />}
                        onCheckedChange={() =>
                          setShowDeactivated(!showDeactivated)
                        }
                        checked={showDeactivated}
                      >{t`Deactivated`}</SettingsRow>
                      {isAdvancedModeEnabled && (
                        <SettingsRow
                          startIcon={<IconSettings />}
                          onCheckedChange={() =>
                            setShowSystemObjects(!showSystemObjects)
                          }
                          checked={showSystemObjects}
                        >{t`System objects`}</SettingsRow>
                      )}
                    </Dropdown.Section>
                  </div>
                </Dropdown.Content>
              </DropdownRoot>
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
            <StyledSettingsDataModelTableBodyContainer>
              <TableBody>
                {filteredObjectSettingsItems.map((objectSettingsItem) => {
                  const isActive =
                    objectSettingsItem.objectMetadataItem.isActive;

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
                        ) : (
                          <SettingsObjectInactiveMenuDropDown
                            isCustomObject={getIsMetadataItemCustom(
                              objectSettingsItem.objectMetadataItem,
                            )}
                            isReadOnly={isDDLLocked}
                            objectMetadataItemNamePlural={
                              objectSettingsItem.objectMetadataItem.namePlural
                            }
                            onEdit={() =>
                              navigate(SettingsPath.ObjectDetail, {
                                objectNamePlural:
                                  objectSettingsItem.objectMetadataItem
                                    .namePlural,
                              })
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
                                objectSettingsItem.objectMetadataItem
                                  .namePlural,
                            })
                          : undefined
                      }
                    />
                  );
                })}
              </TableBody>
            </StyledSettingsDataModelTableBodyContainer>
          </Table>
        </StyledScrollableContent>
      </StyledScrollWrapper>
    </>
  );
};
