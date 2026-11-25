import { type StepFilterGroup } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';

import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { useAddStepFilterToGroup } from '@/workflow/workflow-steps/filters/hooks/useAddStepFilterToGroup';
import { useLingui } from '@lingui/react/macro';

type CoreObjectFilterAddRuleButtonProps = {
  stepFilterGroup: StepFilterGroup;
};

export const CoreObjectFilterAddRuleButton = ({
  stepFilterGroup,
}: CoreObjectFilterAddRuleButtonProps) => {
  const { t } = useLingui();
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
