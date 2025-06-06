import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useLingui } from '@lingui/react/macro';
import { IconChevronDown, useIcons } from 'twenty-ui/display';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { AVAILABLE_ICON_NAMES } from '../constants/availableIconNames';
import {
  StyledIconDropdownTrigger,
  StyledIconPreview,
  StyledIconSelector,
} from '../SettingsImport.styles';

export const IconSelector = ({
  selectedIcon,
  onIconChange,
}: {
  selectedIcon: string;
  onIconChange: (icon: string) => void;
}) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const availableIcons = AVAILABLE_ICON_NAMES.map((iconName) => {
    const IconComponent = getIcon(iconName);
    return {
      value: iconName,
      label: iconName.replace(/^Icon/, ''),
      component: IconComponent,
    };
  }).filter((icon) => icon.component);
  const selectedIconOption = availableIcons.find(
    (icon) => icon.value === selectedIcon,
  );
  return (
    <StyledIconSelector>
      <Dropdown
        dropdownId="object-icon-selector"
        dropdownHotkeyScope={{ scope: 'object-icon-selector' }}
        clickableComponent={
          <StyledIconDropdownTrigger>
            <StyledIconPreview>
              {selectedIconOption?.component && (
                <selectedIconOption.component size={16} />
              )}
              <span>
                {selectedIconOption?.label ||
                  t({ id: 'selectIcon.placeholder', message: 'Select Icon' })}
              </span>
            </StyledIconPreview>
            <IconChevronDown size={16} />
          </StyledIconDropdownTrigger>
        }
        dropdownComponents={
          <>
            <DropdownMenuHeader>
              {t({ id: 'selectIcon.header', message: 'Select Icon' })}
            </DropdownMenuHeader>
            <DropdownMenuSeparator />
            <DropdownMenuItemsContainer hasMaxHeight>
              {availableIcons.map((icon) => (
                <MenuItemSelect
                  key={icon.value}
                  selected={selectedIcon === icon.value}
                  onClick={() => onIconChange(icon.value)}
                  text={icon.label}
                  LeftIcon={icon.component}
                />
              ))}
            </DropdownMenuItemsContainer>
          </>
        }
      />
    </StyledIconSelector>
  );
};
