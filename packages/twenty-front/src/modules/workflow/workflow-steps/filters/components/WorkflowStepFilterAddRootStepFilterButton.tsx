import { useAddRootStepFilter } from '@/workflow/workflow-steps/filters/hooks/useAddRootStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

const StyledButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const WorkflowStepFilterAddRootStepFilterButton = () => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { addRootStepFilter } = useAddRootStepFilter();

  return (
    <StyledButton
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
