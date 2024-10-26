import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { WorkflowStepMock } from '@/workflow/search-variables/types/WorkflowStepMock';
import { isObject } from '@sniptt/guards';
import { useState } from 'react';
import { IconChevronLeft } from 'twenty-ui';

type SearchVariablesDropdownStepSubItemProps = {
  step: WorkflowStepMock;
  onSelect: (value: string) => void;
  onBack: () => void;
};

const SearchVariablesDropdownStepSubItem = ({
  step,
  onSelect,
  onBack,
}: SearchVariablesDropdownStepSubItemProps) => {
  const [currentPath, setCurrentPath] = useState<string[]>([]);

  const getSelectedObject = () => {
    let selected = step.output;
    for (const key of currentPath) {
      selected = selected[key];
    }
    return selected;
  };

  const handleSelect = (key: string) => {
    const selectedObject = getSelectedObject();
    if (isObject(selectedObject[key])) {
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

  const headerLabel = currentPath.length === 0 ? step.name : currentPath.at(-1);

  return (
    <>
      <DropdownMenuHeader StartIcon={IconChevronLeft} onClick={goBack}>
        {headerLabel}
      </DropdownMenuHeader>
      {Object.entries(getSelectedObject()).map(([key, value]) => (
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
