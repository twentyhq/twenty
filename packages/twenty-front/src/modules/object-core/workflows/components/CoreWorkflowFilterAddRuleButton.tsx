import { t } from '@lingui/core/macro';
import { type StepFilterGroup } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useAddStepFilterToGroup } from '@/workflow/workflow-steps/filters/hooks/useAddStepFilterToGroup';

type CoreWorkflowFilterAddRuleButtonProps = {
  stepFilterGroup: StepFilterGroup;
};

export const CoreWorkflowFilterAddRuleButton = ({
  stepFilterGroup,
}: CoreWorkflowFilterAddRuleButtonProps) => {
  const { addStepFilterToGroup } = useAddStepFilterToGroup({
    stepFilterGroup,
  });

  return (
    <CommandMenuButton
      command={{
        Icon: IconPlus,
        label: t`Add rule`,
        shortLabel: t`Add rule`,
        key: 'add-rule',
      }}
      onClick={addStepFilterToGroup}
    />
  );
};
