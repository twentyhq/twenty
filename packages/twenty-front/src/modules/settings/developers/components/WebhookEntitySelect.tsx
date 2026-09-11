import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
import { SelectControl } from '@/ui/input/components/SelectControl';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { selectedItemIdComponentState } from '@/ui/layout/selectable-list/states/selectedItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconDatabase,
  IconFileInfo,
  IconListDetails,
  IconTable,
  IconWebhook,
} from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelect } from 'twenty-ui/navigation';

const WEBHOOK_ENTITY_DROPDOWN_ID = 'webhook-entity-select';

type WebhookEntitySelectProps = {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  dropdownId?: string;
};

export const WebhookEntitySelect = ({
  value,
  onChange,
  disabled = false,
  dropdownId = WEBHOOK_ENTITY_DROPDOWN_ID,
}: WebhookEntitySelectProps) => {
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { closeDropdown } = useCloseDropdown();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const metadataOptions: SelectOption<string>[] = [
    { label: t`All Metadata`, value: 'metadata.*', Icon: IconFileInfo },
    { label: t`Object`, value: 'metadata.objectMetadata', Icon: IconBox },
    { label: t`Field`, value: 'metadata.fieldMetadata', Icon: IconListDetails },
    { label: t`View`, value: 'metadata.view', Icon: IconTable },
    {
      label: t`View Field`,
      value: 'metadata.viewField',
      Icon: IconListDetails,
    },
    { label: t`Index`, value: 'metadata.index', Icon: IconDatabase },
    { label: t`Webhook`, value: 'metadata.webhook', Icon: IconWebhook },
  ];

  const objectOptions: SelectOption<string>[] = [
    { label: t`All Objects`, value: '*', Icon: IconBox },
    ...[...objectMetadataItems]
      .sort((a, b) => a.labelPlural.localeCompare(b.labelPlural))
      .map((item) => ({
        label: item.labelPlural,
        value: item.nameSingular,
        ...getSelectIconPropsFromObjectMetadataItem(item),
      })),
  ];

  const filteredObjectOptions = objectOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const filteredMetadataOptions = metadataOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const selectedOption = !isDefined(value)
    ? { label: t`Select entity`, value: '' }
    : ([...objectOptions, ...metadataOptions].find(
        (option) => option.value === value,
      ) ?? { label: value, value, Icon: IconBox });

  const handleSelect = (selectedValue: string) => {
    if (disabled) return;
    onChange(selectedValue);
    closeDropdown(dropdownId);
    setSearchInput('');
  };

  const shouldShowObjects = filteredObjectOptions.length > 0;
  const shouldShowMetadata = filteredMetadataOptions.length > 0;
  const shouldShowSeparator = shouldShowObjects && shouldShowMetadata;

  const selectableItemIds = [
    ...filteredObjectOptions.map((opt) => opt.value),
    ...filteredMetadataOptions.map((opt) => opt.value),
  ];

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-start"
      disableClickForClickableComponent={disabled}
      onClose={() => setSearchInput('')}
      clickableComponent={
        <SelectControl
          selectedOption={selectedOption}
          isDisabled={disabled}
          textAccent={!isDefined(value) ? 'placeholder' : 'default'}
        />
      }
      dropdownComponents={
        <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
          <DropdownMenuSearchInput
            autoFocus
            value={searchInput}
            placeholder={t`Search...`}
            onChange={(event) => setSearchInput(event.target.value)}
          />
          <DropdownMenuSeparator />
          <SelectableList
            selectableListInstanceId={dropdownId}
            selectableItemIdArray={selectableItemIds}
            focusId={dropdownId}
          >
            <DropdownMenuItemsContainer hasMaxHeight>
              {shouldShowObjects && (
                <>
                  <DropdownMenuSectionLabel label={t`Core Objects`} />
                  {filteredObjectOptions.map((option) => (
                    <SelectableListItem
                      key={option.value}
                      itemId={option.value}
                      onEnter={() => handleSelect(option.value)}
                    >
                      <MenuItemSelect
                        LeftIcon={option.Icon}
                        leftIconColor={option.iconThemeColor}
                        text={option.label}
                        selected={value === option.value}
                        focused={selectedItemId === option.value}
                        onClick={() => handleSelect(option.value)}
                      />
                    </SelectableListItem>
                  ))}
                </>
              )}
              {shouldShowSeparator && <DropdownMenuSeparator />}
              {shouldShowMetadata && (
                <>
                  <DropdownMenuSectionLabel label={t`Metadata`} />
                  {filteredMetadataOptions.map((option) => (
                    <SelectableListItem
                      key={option.value}
                      itemId={option.value}
                      onEnter={() => handleSelect(option.value)}
                    >
                      <MenuItemSelect
                        LeftIcon={option.Icon}
                        text={option.label}
                        selected={value === option.value}
                        focused={selectedItemId === option.value}
                        onClick={() => handleSelect(option.value)}
                      />
                    </SelectableListItem>
                  ))}
                </>
              )}
            </DropdownMenuItemsContainer>
          </SelectableList>
        </DropdownContent>
      }
    />
  );
};
