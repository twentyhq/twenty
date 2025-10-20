import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { JsonTree } from 'twenty-ui/json-visualizer';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { type QueueJob } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

type JobDetailsExpandableProps = {
  job: QueueJob;
  isExpanded: boolean;
};

const StyledDetailsContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border-top: 1px solid ${({ theme }) => theme.border.color.medium};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(4)};

  &:last-child {
    margin-bottom: 0;
  }
`;

const StyledSectionTitle = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const StyledPreformattedText = styled.pre`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.danger};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
  max-height: 300px;
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledLogEntry = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

export const JobDetailsExpandable = ({
  job,
  isExpanded,
}: JobDetailsExpandableProps) => {
  const { copyToClipboard } = useCopyToClipboard();

  const hasData = job.data && Object.keys(job.data).length > 0;
  const hasReturnValue =
    job.returnvalue && Object.keys(job.returnvalue).length > 0;
  const hasLogs = job.logs && job.logs.length > 0;
  const hasStacktrace = job.stacktrace && job.stacktrace.length > 0;
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

        {hasStacktrace && job.stacktrace && (
          <StyledSection>
            <StyledSectionTitle>{t`Stack Trace`}</StyledSectionTitle>
            <StyledPreformattedText>
              {job.stacktrace.join('\n')}
            </StyledPreformattedText>
          </StyledSection>
        )}

        {hasReturnValue && (
          <StyledSection>
            <StyledSectionTitle>{t`Return Value`}</StyledSectionTitle>
            <JsonTree
              value={job.returnvalue}
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

        {hasLogs && job.logs && (
          <StyledSection>
            <StyledSectionTitle>{t`Logs`}</StyledSectionTitle>
            {job.logs.map((log, index) => (
              <StyledLogEntry key={index}>{log}</StyledLogEntry>
            ))}
          </StyledSection>
        )}
      </StyledDetailsContainer>
    </AnimatedExpandableContainer>
  );
};
