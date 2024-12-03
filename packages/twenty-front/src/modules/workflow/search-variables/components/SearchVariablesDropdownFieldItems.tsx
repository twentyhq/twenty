import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';

import { useState } from 'react';
import {
  IconChevronLeft,
  MenuItemSelect,
  OverflowingTextWithTooltip,
  useIcons,
} from 'twenty-ui';

type SearchVariablesDropdownFieldItemsProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

export const SearchVariablesDropdownFieldItems = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownFieldItemsProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');
  const { getIcon } = useIcons();

  const getSelectedObject = () => {
    let selected = step.outputSchema.fields;

    for (const key of currentPath) {
      selected = selected[key]?.value;
    }

    return selected;
  };

  const handleSelect = (key: string) => {
    const selectedObject = getSelectedObject();

    if (!selectedObject[key]?.isLeaf) {
      setCurrentPath([...currentPath, key]);
      setSearchInputValue('');
    } else {
      onSelect(`{{${step.id}.${[...currentPath, key].join('.')}}}`);
    }
  };

  const goBack = () => {
    if (currentPath.length === 0) {
      onBack();
    } else {
      setCurrentPath(currentPath.slice(0, -1));
    }
  };

  const headerLabel = currentPath.length === 0 ? step.name : currentPath.at(-1);

  const options = Object.entries(getSelectedObject());

  const filteredOptions = searchInputValue
    ? options.filter(
        ([_, value]) =>
          value.label &&
          value.label.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return (
    <DropdownMenuItemsContainer>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        <OverflowingTextWithTooltip text={headerLabel} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={(event) => setSearchInputValue(event.target.value)}
      />
      {filteredOptions.map(([key, value]) => (
        <MenuItemSelect
          key={key}
          selected={false}
          hovered={false}
          onClick={() => handleSelect(key)}
          text={value.label || key}
          hasSubMenu={!value.isLeaf}
          LeftIcon={value.icon ? getIcon(value.icon) : undefined}
        />
      ))}
    </DropdownMenuItemsContainer>
  );
};
