import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectMetadataSelectHelpers } from '@/object-metadata/hooks/useObjectMetadataSelectHelpers';
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
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconChevronDown,
  IconCode,
  IconEye,
  IconNorthStar,
  IconSettings,
  IconTable,
} from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const WEBHOOK_ENTITY_DROPDOWN_ID = 'webhook-entity-select';

const StyledControlContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;

  &:hover {
    background-color: ${({ disabled }) =>
      disabled
        ? themeCssVariables.background.transparent.lighter
        : themeCssVariables.background.transparent.light};
  }
`;

const StyledControlLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledControlIconChevronDownContainer = styled.span<{
  disabled?: boolean;
}>`
  align-items: center;
  color: ${({ disabled }) =>
    disabled
      ? themeCssVariables.font.color.extraLight
      : themeCssVariables.font.color.tertiary};
  display: flex;
`;

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
  const { theme } = useContext(ThemeContext);
  const { getSelectIconPropsFromObjectMetadataItem } =
    useObjectMetadataSelectHelpers();
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { closeDropdown } = useCloseDropdown();

  const selectedItemId = useAtomComponentStateValue(
    selectedItemIdComponentState,
    dropdownId,
  );

  const metadataOptions = [
    { label: t`All Metadata`, value: 'metadata.*', icon: IconNorthStar },
    { label: t`Object`, value: 'metadata.objectMetadata', icon: IconTable },
    { label: t`Field`, value: 'metadata.fieldMetadata', icon: IconBox },
    { label: t`View`, value: 'metadata.view', icon: IconEye },
    { label: t`View Field`, value: 'metadata.viewField', icon: IconEye },
    { label: t`Index`, value: 'metadata.index', icon: IconSettings },
    { label: t`Webhook`, value: 'metadata.webhook', icon: IconCode },
  ];

  const objectOptions: SelectOption<string>[] = [
    { label: t`All Objects`, value: '*', Icon: IconNorthStar },
    ...objectMetadataItems.map((item) => ({
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

  const getSelectedLabel = () => {
    if (!isDefined(value)) {
      return t`Select entity`;
    }
    if (value === '*') {
      return t`All Objects`;
    }

    const metadataOption = metadataOptions.find((opt) => opt.value === value);
    if (isDefined(metadataOption)) {
      return metadataOption.label;
    }

    const objectOption = objectOptions.find((opt) => opt.value === value);
    if (isDefined(objectOption)) {
      return objectOption.label;
    }

    return value;
  };

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
        <StyledControlContainer disabled={disabled}>
          <StyledControlLabel>{getSelectedLabel()}</StyledControlLabel>
          <StyledControlIconChevronDownContainer disabled={disabled}>
            <IconChevronDown size={theme.icon.size.md} />
          </StyledControlIconChevronDownContainer>
        </StyledControlContainer>
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
                        LeftIcon={option.icon}
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
