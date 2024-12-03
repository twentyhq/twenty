import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import {
  RecordOutputSchema,
  StepOutputSchema,
} from '@/workflow/search-variables/types/StepOutputSchema';
import { isDefined, MenuItem, MenuItemSelect } from 'twenty-ui';

type SearchVariablesDropdownWorkflowStepItemsProps = {
  steps: StepOutputSchema[];
  onSelect: (value: string) => void;
  objectNameSingularToSelect?: string;
};

export const SearchVariablesDropdownWorkflowStepItems = ({
  steps,
  onSelect,
  objectNameSingularToSelect,
}: SearchVariablesDropdownWorkflowStepItemsProps) => {
  const availableSteps = objectNameSingularToSelect
    ? steps.filter((step) => {
        const recordOutputSchema = step.outputSchema as RecordOutputSchema;
        console.log('recordOutputSchema', recordOutputSchema);
        return (
          isDefined(recordOutputSchema.object) &&
          recordOutputSchema.object.nameSingular === objectNameSingularToSelect
        );
      })
    : steps;

  return (
    <DropdownMenuItemsContainer>
      {availableSteps.length > 0 ? (
        availableSteps.map((item, _index) => (
          <MenuItemSelect
            key={`step-${item.id}`}
            selected={false}
            hovered={false}
            onClick={() => onSelect(item.id)}
            text={item.name}
            LeftIcon={undefined}
            hasSubMenu
          />
        ))
      ) : (
        <MenuItem
          key="no-steps"
          onClick={() => {}}
          text="No variables available"
          LeftIcon={undefined}
          hasSubMenu={false}
        />
      )}
    </DropdownMenuItemsContainer>
  );
};
