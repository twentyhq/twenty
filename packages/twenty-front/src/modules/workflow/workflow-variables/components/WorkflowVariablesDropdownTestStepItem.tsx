import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useOpenWorkflowStepTestTab } from '@/workflow/workflow-variables/hooks/useOpenWorkflowStepTestTab';
import { type StepOutputSchemaV2 } from '@/workflow/workflow-variables/types/StepOutputSchemaV2';
import { useLingui } from '@lingui/react/macro';
import { IconPlayerPlay } from 'twenty-ui/icon';
import { Dropdown } from 'twenty-ui/components/navigation';

type WorkflowVariablesDropdownTestStepItemProps = {
  step: Pick<StepOutputSchemaV2, 'id' | 'name' | 'icon' | 'type'>;
};

export const WorkflowVariablesDropdownTestStepItem = ({
  step,
}: WorkflowVariablesDropdownTestStepItemProps) => {
  const { t } = useLingui();
  const { openWorkflowStepTestTab } = useOpenWorkflowStepTestTab();

  return (
    <Dropdown.OptionItem
      onSelect={() => openWorkflowStepTestTab(step)}
      hasSubmenu={false}
      startIcon={<SelectOptionIcon Icon={IconPlayerPlay} />}
    >
      {t`Test this step to see its outputs`}
    </Dropdown.OptionItem>
  );
};
