import { WorkflowExpectedOutputBodyInput } from '@/workflow/workflow-steps/components/WorkflowExpectedOutputBodyInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconChevronDown } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledChevron = styled.span`
  display: flex;

  [data-panel-open] & {
    transform: rotate(180deg);
  }
`;

const StyledPanelContent = styled.div`
  width: 100%;
`;

type McpToolExpectedOutputAdvancedSectionProps = {
  expectedOutputSchema: object | undefined;
  readonly?: boolean;
  onChange: (parsedValue: Record<string, unknown>) => void;
};

export const McpToolExpectedOutputAdvancedSection = ({
  expectedOutputSchema,
  readonly,
  onChange,
}: McpToolExpectedOutputAdvancedSectionProps) => {
  const { t } = useLingui();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledContainer />}
    >
      <Collapsible.Trigger
        render={
          <Button
            variant="link"
            endIcon={
              <StyledChevron>
                <IconChevronDown size={14} />
              </StyledChevron>
            }
          />
        }
      >
        {t`Advanced`}
      </Collapsible.Trigger>
      <Collapsible.Panel>
        <StyledPanelContent>
          <WorkflowExpectedOutputBodyInput
            defaultValue={expectedOutputSchema}
            onChange={onChange}
            readonly={readonly}
          />
        </StyledPanelContent>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
};
