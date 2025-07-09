import { useAddRootStepFilter } from '@/workflow/workflow-steps/workflow-actions/filter-action/hooks/useAddRootStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/workflow-actions/filter-action/states/context/WorkflowStepFilterContext';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

export const WorkflowStepFilterAddRootStepFilterButton = () => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { addRootStepFilter } = useAddRootStepFilter();

  return (
    <Button
      Icon={IconFilter}
      size="small"
      variant="secondary"
      accent="default"
      onClick={addRootStepFilter}
      ariaLabel={t`Add first filter`}
      title={t`Add first filter`}
      disabled={readonly}
    />
  );
};
