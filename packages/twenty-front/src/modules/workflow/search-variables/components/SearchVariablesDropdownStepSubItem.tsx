import {
  OverflowingTextWithTooltip,
  IconChevronLeft,
  MenuItemSelect,
  useIcons,
} from 'twenty-ui';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import {
  OutputSchema,
  StepOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';
import { useState } from 'react';
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
  const { getIcon } = useIcons();

  const getSelectedObject = (): OutputSchema => {
    let selected = step.outputSchema;
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
    ? options.filter(([key]) =>
        key.toLowerCase().includes(searchInputValue.toLowerCase()),
      )
    : options;

  return (
    <>
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
          text={key}
          hasSubMenu={!value.isLeaf}
          LeftIcon={value.icon ? getIcon(value.icon) : undefined}
        />
      ))}
    </>
  );
};

export default SearchVariablesDropdownStepSubItem;
