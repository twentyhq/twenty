import { SelectControl } from '@/ui/input/components/SelectControl';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { WorkflowObjectDropdownContent } from '@/workflow/workflow-steps/workflow-actions/find-records-action/components/WorkflowObjectDropdownContent';
import { Dropdown } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/primitives/input';

type WorkflowObjectSelectProps = {
  dropdownId: string;
  label: string;
  selectedOption: SelectOption<string>;
  disabled: boolean;
  onSelect: (objectNameSingular: string) => void;
};

export const WorkflowObjectSelect = ({
  dropdownId,
  label,
  selectedOption,
  disabled,
  onSelect,
}: WorkflowObjectSelectProps) => {
  if (disabled) {
    return <SelectControl isDisabled selectedOption={selectedOption} />;
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="picker">
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        <SelectControl selectedOption={selectedOption} />
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.ExtraLarge}
        align="start"
        sideOffset={4}
        aria-label={label}
      >
        <WorkflowObjectDropdownContent onOptionClick={onSelect} />
      </DropdownContent>
    </DropdownRoot>
  );
};
