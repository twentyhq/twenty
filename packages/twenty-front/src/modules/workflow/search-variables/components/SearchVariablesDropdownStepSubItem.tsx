import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { useState } from 'react';
import { IconChevronLeft } from 'twenty-ui';

type SearchVariablesDropdownStepSubItemProps = {
  step: any;
  onSelect: (value: any) => void;
  onBack: () => void;
};

const SearchVariablesDropdownStepSubItem = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownStepSubItemProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getCurrentObject = () => {
    let current = step.output;
    for (const key of currentPath) {
      current = current[key];
    }
    return current;
  };

  const handleSelect = (key: string) => {
    const current = getCurrentObject();
    if (typeof current[key] === 'object' && current[key] !== null) {
      setCurrentPath([...currentPath, key]);
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

  const headerLabel =
    currentPath.length === 0 ? step.name : currentPath[currentPath.length - 1];

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        {headerLabel}
      </DropdownMenuHeader>
      {Object.entries(getCurrentObject()).map(([key, value]) => (
        <MenuItemSelect
          selected={false}
          hovered={false}
          onClick={() => handleSelect(key)}
          text={key}
          hasSubMenu={typeof value === 'object'}
          LeftIcon={undefined}
        />
      ))}
    </>
  );
};

export default SearchVariablesDropdownStepSubItem;
