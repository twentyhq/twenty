import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { Step } from '@/workflow/search-variables/components/SearchVariablesDropdown';

type SearchVariablesDropdownStepItemProps = {
  steps: Step[];
  onSelect: (value: any) => void;
};

export const SearchVariablesDropdownStepItem = ({
  steps,
  onSelect,
}: SearchVariablesDropdownStepItemProps) => {
  return (
    <>
      {steps.map((item, _index) => (
        <MenuItemSelect
          key={`step-${item.id}`}
          selected={false}
          hovered={false}
          onClick={() => onSelect(item.id)}
          text={item.name}
          LeftIcon={undefined}
          hasSubMenu
        />
      ))}
    </>
  );
};
