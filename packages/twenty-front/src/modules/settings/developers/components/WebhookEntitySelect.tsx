import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
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
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  IconBox,
  IconChevronDown,
  IconCode,
  IconEye,
  IconNorthStar,
  IconSettings,
  IconTable,
  useIcons,
} from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';

const WEBHOOK_ENTITY_DROPDOWN_ID = 'webhook-entity-select';

const StyledControlContainer = styled.div<{ disabled?: boolean }>`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-sizing: border-box;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  width: 100%;

  &:hover {
    background-color: ${({ theme, disabled }) =>
      disabled
        ? theme.background.transparent.lighter
        : theme.background.transparent.light};
  }
`;

const StyledControlLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledControlIconChevronDown = styled(IconChevronDown)<{
  disabled?: boolean;
}>`
  color: ${({ disabled, theme }) =>
    disabled ? theme.font.color.extraLight : theme.font.color.tertiary};
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
  const theme = useTheme();
  const [searchInput, setSearchInput] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();

  const selectedItemId = useRecoilComponentValue(
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

  const objectOptions = [
    { label: t`All Objects`, value: '*', Icon: IconNorthStar },
    ...objectMetadataItems.map((item) => ({
      label: item.labelPlural,
      value: item.nameSingular,
      Icon: getIcon(item.icon),
    })),
  ];

  const filteredObjectOptions = objectOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  const filteredMetadataOptions = metadataOptions.filter((option) =>
    option.label.toLowerCase().includes(searchInput.toLowerCase()),
  );

  // Find selected option label for display
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
          <StyledControlIconChevronDown
            disabled={disabled}
            size={theme.icon.size.md}
          />
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
