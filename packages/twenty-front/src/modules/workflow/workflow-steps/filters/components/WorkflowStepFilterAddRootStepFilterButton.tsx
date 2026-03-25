import { useAddRootStepFilter } from '@/workflow/workflow-steps/filters/hooks/useAddRootStepFilter';
import { WorkflowStepFilterContext } from '@/workflow/workflow-steps/filters/states/context/WorkflowStepFilterContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconFilter } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[2]};
`;

export const WorkflowStepFilterAddRootStepFilterButton = () => {
  const { t } = useLingui();
  const { readonly } = useContext(WorkflowStepFilterContext);
  const { addRootStepFilter } = useAddRootStepFilter();

  return (
    <StyledButtonContainer>
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
    </StyledButtonContainer>
  );
};
