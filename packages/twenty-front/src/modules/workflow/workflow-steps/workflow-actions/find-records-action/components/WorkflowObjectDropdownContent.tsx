import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useCallback, useMemo, useState } from 'react';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowObjectDropdownContentProps = {
  onOptionClick: (value: string) => void;
  showAdvancedOption?: boolean;
};

export const WorkflowObjectDropdownContent = ({
  onOptionClick,
  showAdvancedOption = false,
}: WorkflowObjectDropdownContentProps) => {
  const { getIcon } = useIcons();

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const activeStandardObjectOptions = useMemo(
    () =>
      objectMetadataItems
        .filter(
          (objectMetadataItem) =>
            objectMetadataItem.isActive && !objectMetadataItem.isSystem,
        )
        .map((objectMetadataItem) => ({
          Icon: getIcon(objectMetadataItem.icon),
          label: objectMetadataItem.labelPlural,
          value: objectMetadataItem.nameSingular,
        })),
    [objectMetadataItems, getIcon],
  );

  const activeSystemObjectOptions = useMemo(
    () =>
      objectMetadataItems
        .filter(
          (objectMetadataItem) =>
            objectMetadataItem.isActive && objectMetadataItem.isSystem,
        )
        .map((objectMetadataItem) => ({
          Icon: getIcon(objectMetadataItem.icon),
          label: objectMetadataItem.labelPlural,
          value: objectMetadataItem.nameSingular,
        })),
    [objectMetadataItems, getIcon],
  );

  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSystemObjectsOpen, setIsSystemObjectsOpen] = useState(false);

  const shouldShowAdvanced =
    showAdvancedOption &&
    (!isNonEmptyString(searchInputValue) ||
      searchInputValue.toLowerCase().includes('advanced'));

  const filteredStandardObjectOptions = useMemo(
    () =>
      activeStandardObjectOptions.filter((option) =>
        option.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      ),
    [activeStandardObjectOptions, searchInputValue],
  );

  const filteredSystemObjectOptions = useMemo(
    () =>
      activeSystemObjectOptions.filter((option) =>
        option.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      ),
    [activeSystemObjectOptions, searchInputValue],
  );

  const filteredOptions = isSystemObjectsOpen
    ? filteredSystemObjectOptions
    : filteredStandardObjectOptions;

  const handleSystemObjectsClick = () => {
    setIsSystemObjectsOpen(true);
    setSearchInputValue('');
  };

  const handleBack = () => {
    setIsSystemObjectsOpen(false);
    setSearchInputValue('');
  };

  const handleSearchInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInputValue(event.target.value);
    },
    [],
  );

  // const onAdvancedClick={
  //   !isSystemObjectsOpen ? handleSystemObjectsClick : undefined
  // }

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      {isSystemObjectsOpen && onBack && (
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
