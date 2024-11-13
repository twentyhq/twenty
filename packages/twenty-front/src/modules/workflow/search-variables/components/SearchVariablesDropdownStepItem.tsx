import { StepOutputSchema } from '@/workflow/search-variables/types/StepOutputSchema';
import { MenuItem, MenuItemSelect } from 'twenty-ui';

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
