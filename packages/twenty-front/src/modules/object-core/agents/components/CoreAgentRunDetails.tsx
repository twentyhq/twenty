import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { CoreAgentModelCell } from '@/object-core/agents/components/CoreAgentModelCell';
import { type CoreAgentRun } from '@/object-core/agents/types/CoreAgentRun';

const StyledDetails = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]};
  grid-template-columns: 120px minmax(0, 1fr);
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledText = styled.div`
  color: ${themeCssVariables.font.color.primary};
  min-width: 0;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
`;

const StyledError = styled(StyledText)`
  color: ${themeCssVariables.color.red};
`;

const StyledTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type CoreAgentRunDetailsProps = {
  run: CoreAgentRun;
};

export const CoreAgentRunDetails = ({ run }: CoreAgentRunDetailsProps) => (
  <StyledDetails>
    {isNonEmptyString(run.errorMessage) && (
      <>
        <StyledLabel>{t`Error`}</StyledLabel>
        <StyledError>{run.errorMessage}</StyledError>
      </>
    )}
    <StyledLabel>{t`Input`}</StyledLabel>
    <StyledText>{run.input ?? t`No input`}</StyledText>
    <StyledLabel>{t`Reply`}</StyledLabel>
    <StyledText>{run.reply ?? t`No reply`}</StyledText>
    {isNonEmptyArray(run.toolNames) && (
      <>
        <StyledLabel>{t`Tools`}</StyledLabel>
        <StyledTags>
          {run.toolNames.map((toolName) => (
            <Tag key={toolName} color="gray">
              {toolName}
            </Tag>
          ))}
        </StyledTags>
      </>
    )}
    {isDefined(run.modelId) && (
      <>
        <StyledLabel>{t`Model`}</StyledLabel>
        <CoreAgentModelCell modelId={run.modelId} />
      </>
    )}
    {isNonEmptyString(run.threadTitle) && (
      <>
        <StyledLabel>{t`Conversation`}</StyledLabel>
        <StyledText>{run.threadTitle}</StyledText>
      </>
    )}
  </StyledDetails>
);
