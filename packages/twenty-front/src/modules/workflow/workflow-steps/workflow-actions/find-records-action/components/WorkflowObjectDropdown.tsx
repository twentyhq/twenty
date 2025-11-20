import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconChevronLeft, IconSettings, type IconComponent } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type ObjectOption = {
  value: string;
  Icon: IconComponent;
  label: string;
};

type WorkflowObjectDropdownProps = {
  isSystemObjectsView: boolean;
  searchInputValue: string;
  filteredOptions: ObjectOption[];
  onSearchInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onOptionClick: (value: string) => void;
  onBack?: () => void;
  onAdvancedClick?: () => void;
  showAdvancedOption?: boolean;
};

export const WorkflowObjectDropdown = ({
  isSystemObjectsView,
  searchInputValue,
  filteredOptions,
  onSearchInputChange,
  onOptionClick,
  onBack,
  onAdvancedClick,
  showAdvancedOption = false,
}: WorkflowObjectDropdownProps) => {
  const shouldShowAdvanced =
    showAdvancedOption &&
    (!isNonEmptyString(searchInputValue) ||
      searchInputValue.toLowerCase().includes('advanced'));

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      {isSystemObjectsView && onBack && (
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={onBack}
              Icon={IconChevronLeft}
            />
          }
        >
          <Trans>Advanced</Trans>
        </DropdownMenuHeader>
      )}
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={onSearchInputChange}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredOptions.map((option) => (
          <MenuItem
            key={option.value}
            LeftIcon={option.Icon}
            text={option.label}
            onClick={() => onOptionClick(option.value)}
          />
        ))}
        {shouldShowAdvanced && onAdvancedClick && (
          <MenuItem
            text={<Trans>Advanced</Trans>}
            LeftIcon={IconSettings}
            onClick={onAdvancedClick}
            hasSubMenu
          />
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};

