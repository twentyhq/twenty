import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCopy, IconTerminal } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTab = styled.button<{ isActive: boolean; hasError?: boolean }>`
  background: ${({ isActive }) =>
    isActive ? themeCssVariables.background.secondary : 'transparent'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.xs};
  color: ${({ isActive, hasError }) =>
    hasError
      ? themeCssVariables.color.red
      : isActive
        ? themeCssVariables.font.color.primary
        : themeCssVariables.font.color.tertiary};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${({ isActive }) =>
    isActive
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  padding: ${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]};

  &:hover {
    background: ${themeCssVariables.background.secondary};
    color: ${({ hasError }) =>
      hasError
        ? themeCssVariables.color.red
        : themeCssVariables.font.color.primary};
  }
`;

const StyledOutputArea = styled.div<{ isError?: boolean }>`
  background: ${themeCssVariables.background.tertiary};
  color: ${({ isError }) =>
    isError
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.primary};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[2]};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledEmptyMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-style: italic;
`;

const StyledCursor = styled.span`
  animation: blink 1s step-end infinite;
  background: ${themeCssVariables.font.color.primary};
  display: inline-block;
  height: 1em;
  margin-left: 2px;
  vertical-align: text-bottom;
  width: 8px;

  @keyframes blink {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
  }
`;

type TabType = 'stdout' | 'stderr';

type TerminalOutputProps = {
  stdout: string;
  stderr: string;
  isRunning?: boolean;
};

export const TerminalOutput = ({
  stdout,
  stderr,
  isRunning = false,
}: TerminalOutputProps) => {
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();

  const hasStderr = stderr.length > 0;
  const hasStdout = stdout.length > 0;

  const defaultTab: TabType = hasStderr && !hasStdout ? 'stderr' : 'stdout';
  const [userSelectedTab, setUserSelectedTab] = useState<TabType | null>(null);
  const activeTab = userSelectedTab ?? defaultTab;

  const currentOutput = activeTab === 'stdout' ? stdout : stderr;

  return (
    <StyledContainer>
      <StyledHeader>
        <StyledHeaderLeft>
          <IconTerminal size={14} />
          {t`Output`}
        </StyledHeaderLeft>
        <StyledTabContainer>
          <StyledTab
            isActive={activeTab === 'stdout'}
            onClick={() => setUserSelectedTab('stdout')}
          >
            stdout
          </StyledTab>
          {hasStderr && (
            <StyledTab
              isActive={activeTab === 'stderr'}
              hasError
              onClick={() => setUserSelectedTab('stderr')}
            >
              stderr
            </StyledTab>
          )}
          <LightIconButton
            Icon={IconCopy}
            onClick={() => copyToClipboard(currentOutput)}
            title={t`Copy output`}
            size="small"
            accent="tertiary"
          />
        </StyledTabContainer>
      </StyledHeader>
      <StyledOutputArea isError={activeTab === 'stderr'}>
        {currentOutput ? (
          <>
            {currentOutput}
            {isRunning && <StyledCursor />}
          </>
        ) : (
          <StyledEmptyMessage>
            {isRunning ? t`Waiting for output...` : t`No output`}
          </StyledEmptyMessage>
        )}
      </StyledOutputArea>
    </StyledContainer>
  );
};
