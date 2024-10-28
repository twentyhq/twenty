import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemSelect } from '@/ui/navigation/menu-item/components/MenuItemSelect';
import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';

type SearchVariablesDropdownStepItemProps = {
  steps: StepOutputSchema[];
  onSelect: (value: string) => void;
};

export const SearchVariablesDropdownStepItem = ({
  steps,
  onSelect,
}: SearchVariablesDropdownStepItemProps) => {
  return steps.length > 0 ? (
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
  ) : (
    <MenuItem
      key="no-steps"
      onClick={() => {}}
      text="No variables available"
      LeftIcon={undefined}
      hasSubMenu={false}
    />
  );
};
