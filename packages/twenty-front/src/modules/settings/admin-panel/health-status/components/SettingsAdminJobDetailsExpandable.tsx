import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type QueueJob } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type SettingsAdminJobDetailsExpandableProps = {
  job: QueueJob;
  isExpanded: boolean;
};

const StyledDetailsContainer = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledSection = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[2]};
`;

const StyledPreformattedText = styled.pre`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.danger};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
  max-height: 300px;
  overflow: auto;
  padding: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledLogEntry = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.sm};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminJobDetailsExpandable = ({
  job,
  isExpanded,
}: SettingsAdminJobDetailsExpandableProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const hasData = job.data && Object.keys(job.data).length > 0;
  const hasReturnValue =
    job.returnValue && Object.keys(job.returnValue).length > 0;
  const hasLogs = job.logs && job.logs.length > 0;
  const hasStacktrace = job.stackTrace && job.stackTrace.length > 0;
  const hasFailedReason = job.failedReason;

  const isAnyNode = () => true;

  return (
    <AnimatedExpandableContainer
      isExpanded={isExpanded}
      dimension="height"
      mode="scroll-height"
    >
      <StyledDetailsContainer>
        {hasFailedReason && (
          <StyledSection>
            <StyledSectionTitle>{t`Error Message`}</StyledSectionTitle>
            <StyledPreformattedText>{job.failedReason}</StyledPreformattedText>
          </StyledSection>
        )}

        {hasStacktrace && job.stackTrace && (
          <StyledSection>
            <StyledSectionTitle>{t`Stack Trace`}</StyledSectionTitle>
            <StyledPreformattedText>
              {job.stackTrace.join('\n')}
            </StyledPreformattedText>
          </StyledSection>
        )}

        {hasReturnValue && (
          <StyledSection>
            <StyledSectionTitle>{t`Return Value`}</StyledSectionTitle>
            <JsonTree
              value={job.returnValue}
              shouldExpandNodeInitially={isAnyNode}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              onNodeValueClick={copyToClipboard}
            />
          </StyledSection>
        )}

        {hasData && (
          <StyledSection>
            <StyledSectionTitle>{t`Job Data`}</StyledSectionTitle>
            <JsonTree
              value={job.data}
              shouldExpandNodeInitially={isAnyNode}
              emptyArrayLabel={t`Empty Array`}
              emptyObjectLabel={t`Empty Object`}
              emptyStringLabel={t`[empty string]`}
              arrowButtonCollapsedLabel={t`Expand`}
              arrowButtonExpandedLabel={t`Collapse`}
              onNodeValueClick={copyToClipboard}
            />
          </StyledSection>
        )}

        {hasLogs && (
          <StyledSection>
            <StyledSectionTitle>{t`Logs`}</StyledSectionTitle>
            {job.logs?.map((log, index) => (
              <StyledLogEntry key={index}>{log}</StyledLogEntry>
            ))}
          </StyledSection>
        )}
      </StyledDetailsContainer>
    </AnimatedExpandableContainer>
  );
};
