import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
import { isObject } from '@sniptt/guards';
import { useState } from 'react';
import { IconChevronLeft, MenuItemSelect } from 'twenty-ui';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';

type SearchVariablesDropdownStepSubItemProps = {
  step: StepOutputSchema;
  onSelect: (value: string) => void;
  onBack: () => void;
};

const SearchVariablesDropdownStepSubItem = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownStepSubItemProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [searchInputValue, setSearchInputValue] = useState('');

  const getSelectedObject = () => {
    let selected = step.outputSchema;
    for (const key of currentPath) {
      selected = selected[key];
    }
    return selected;
  };

  const handleSelect = (key: string) => {
    const selectedObject = getSelectedObject();

    if (isObject(selectedObject[key])) {
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
    ? options.filter(([key]) =>
        key.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        {headerLabel}
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
          text={key}
          hasSubMenu={isObject(value)}
          LeftIcon={undefined}
        />
      ))}
    </>
  );
};

export default SearchVariablesDropdownStepSubItem;
