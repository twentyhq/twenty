import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCube, IconFilter, useIcons } from 'twenty-ui/display';
import { IconButton } from 'twenty-ui/input';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

import { getStandardObjectIconColor } from '@/navigation-menu-item/common/utils/getStandardObjectIconColor';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const OBJECT_FILTER_DROPDOWN_ID = 'side-panel-object-filter-dropdown';

const ObjectFilterDropdownContent = ({
  selectedObjectNameSingular,
  onSelectObject,
}: {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [filterSearch, setFilterSearch] = useState('');
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { closeDropdown } = useCloseDropdown();

  const filteredObjectItems = useMemo(
    () =>
      activeObjectMetadataItems.filter(
        (item) =>
          item.isSearchable &&
          item.labelPlural.toLowerCase().includes(filterSearch.toLowerCase()),
      ),
    [activeObjectMetadataItems, filterSearch],
  );

  const handleSelect = (objectNameSingular: string | null) => {
    onSelectObject(objectNameSingular);
    closeDropdown(OBJECT_FILTER_DROPDOWN_ID);
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader>{t`Object`}</DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={filterSearch}
        onChange={(event) => setFilterSearch(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <MenuItemSelectAvatar
          avatar={<NavigationMenuItemStyleIcon Icon={IconCube} color="gray" />}
          text={t`All Objects`}
          selected={selectedObjectNameSingular === null}
          onClick={() => handleSelect(null)}
        />
        {filteredObjectItems.map((objectMetadataItem) => {
          const ObjectIcon = getIcon(objectMetadataItem.icon);
          const iconColor = getStandardObjectIconColor(
            objectMetadataItem.nameSingular,
          );

          return (
            <MenuItemSelectAvatar
              key={objectMetadataItem.id}
              avatar={
                <NavigationMenuItemStyleIcon
                  Icon={ObjectIcon}
                  color={iconColor}
                />
              }
              text={objectMetadataItem.labelPlural}
              selected={
                selectedObjectNameSingular === objectMetadataItem.nameSingular
              }
              onClick={() => handleSelect(objectMetadataItem.nameSingular)}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

type SidePanelObjectFilterDropdownProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdown = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownProps) => {
  const { t } = useLingui();
  const isFilterActive = isDefined(selectedObjectNameSingular);

  return (
    <Dropdown
      dropdownId={OBJECT_FILTER_DROPDOWN_ID}
      dropdownPlacement="bottom-end"
      clickableComponent={
        <IconButton
          Icon={IconFilter}
          variant="tertiary"
          accent={isFilterActive ? 'blue' : 'default'}
          size="small"
          ariaLabel={t`Filter by object type`}
        />
      }
      dropdownComponents={
        <ObjectFilterDropdownContent
          selectedObjectNameSingular={selectedObjectNameSingular}
          onSelectObject={onSelectObject}
        />
      }
    />
  );
};
