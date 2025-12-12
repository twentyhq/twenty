import { usePageLayoutIdFromContextStoreTargetedRecord } from '@/command-menu/pages/page-layout/hooks/usePageLayoutFromContextStoreTargetedRecord';
import { useResetChartDraftFiltersSettings } from '@/command-menu/pages/page-layout/hooks/useResetChartDraftFiltersSettings';
import { useUpdateCurrentWidgetConfig } from '@/command-menu/pages/page-layout/hooks/useUpdateCurrentWidgetConfig';
import { useWidgetInEditMode } from '@/command-menu/pages/page-layout/hooks/useWidgetInEditMode';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { DropdownComponentInstanceContext } from '@/ui/layout/dropdown/contexts/DropdownComponentInstanceContext';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';
import { filterBySearchQuery } from '~/utils/filterBySearchQuery';

const ADVANCED_OBJECTS_MENU_ITEM_ID = 'advanced-objects';

export const ChartDataSourceDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdvancedObjectsMenuOpened, setIsAdvancedObjectsMenuOpened] =
    useState(false);
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { pageLayoutId } = usePageLayoutIdFromContextStoreTargetedRecord();

  const { widgetInEditMode } = useWidgetInEditMode(pageLayoutId);

  const currentObjectMetadataItemId = widgetInEditMode?.objectMetadataId as
    | string
    | undefined;

  const dropdownId = useAvailableComponentInstanceIdOrThrow(
    DropdownComponentInstanceContext,
  );

  const selectedItemId = useRecoilComponentValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const objectsWithReadAccess = objectMetadataItems.filter(
    (objectMetadataItem) => {
      const objectPermissions =
        objectPermissionsByObjectMetadataId[objectMetadataItem.id];

      return (
        isDefined(objectPermissions) &&
        objectPermissions.canReadObjectRecords &&
        objectMetadataItem.isActive
      );
    },
  );

  const regularObjects = objectsWithReadAccess
    .filter((item) => !item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const systemObjects = objectsWithReadAccess
    .filter((item) => item.isSystem)
    .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural));

  const availableObjectMetadataItems = filterBySearchQuery({
    items: isAdvancedObjectsMenuOpened ? systemObjects : regularObjects,
    searchQuery,
    getSearchableValues: (item) => [item.labelPlural, item.namePlural],
  });

  const { updateCurrentWidgetConfig } =
    useUpdateCurrentWidgetConfig(pageLayoutId);

  const { closeDropdown } = useCloseDropdown();

  const { getIcon } = useIcons();

  const { resetChartDraftFiltersSettings } =
    useResetChartDraftFiltersSettings();

  const handleSelectSource = (newObjectMetadataItemId: string) => {
    if (currentObjectMetadataItemId !== newObjectMetadataItemId) {
      updateCurrentWidgetConfig({
        objectMetadataId: newObjectMetadataItemId,
        configToUpdate: {
          aggregateFieldMetadataId: null,
          primaryAxisGroupByFieldMetadataId: null,
          primaryAxisGroupBySubFieldName: null,
          secondaryAxisGroupByFieldMetadataId: null,
          secondaryAxisGroupBySubFieldName: null,
          primaryAxisOrderBy: null,
          secondaryAxisOrderBy: null,
          groupByFieldMetadataId: null,
          groupBySubFieldName: null,
          filter: {},
          ratioAggregateConfig: null,
        },
      });

      if (isDefined(currentObjectMetadataItemId)) {
        resetChartDraftFiltersSettings(currentObjectMetadataItemId);
      }
    }
    closeDropdown();
  };

  const handleAdvancedObjectsClick = () => {
    setIsAdvancedObjectsMenuOpened(true);
    setSearchQuery('');
  };

  const handleBack = () => {
    setIsAdvancedObjectsMenuOpened(false);
    setSearchQuery('');
  };

  return (
    <>
      {isAdvancedObjectsMenuOpened && (
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={handleBack}
              Icon={IconChevronLeft}
            />
          }
        >
          <Trans>Advanced objects</Trans>
        </DropdownMenuHeader>
      )}
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder={t`Search objects`}
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer>
        <SelectableList
          selectableListInstanceId={dropdownId}
          focusId={dropdownId}
          selectableItemIdArray={[
            ...availableObjectMetadataItems.map(
              (objectMetadataItem) => objectMetadataItem.id,
            ),
            ...(!isAdvancedObjectsMenuOpened
              ? [ADVANCED_OBJECTS_MENU_ITEM_ID]
              : []),
          ]}
        >
          {availableObjectMetadataItems.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => {
                handleSelectSource(objectMetadataItem.id);
              }}
            >
              <MenuItemSelect
                text={objectMetadataItem.labelPlural}
                selected={currentObjectMetadataItemId === objectMetadataItem.id}
                focused={selectedItemId === objectMetadataItem.id}
                LeftIcon={getIcon(objectMetadataItem.icon)}
                onClick={() => {
                  handleSelectSource(objectMetadataItem.id);
                }}
              />
            </SelectableListItem>
          ))}
          {!isAdvancedObjectsMenuOpened && (
            <SelectableListItem
              itemId={ADVANCED_OBJECTS_MENU_ITEM_ID}
              onEnter={handleAdvancedObjectsClick}
            >
              <MenuItem
                text={t`Advanced objects`}
                LeftIcon={IconSettings}
                onClick={handleAdvancedObjectsClick}
                hasSubMenu
              />
            </SelectableListItem>
          )}
        </SelectableList>
      </DropdownMenuItemsContainer>
    </>
  );
};
