import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconCopy, IconTerminal } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  overflow: hidden;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.tertiary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTabContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledTab = styled.button<{ isActive: boolean; hasError?: boolean }>`
  background: ${({ isActive, theme }) =>
    isActive ? theme.background.secondary : 'transparent'};
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.xs};
  color: ${({ isActive, hasError, theme }) =>
    hasError
      ? theme.color.red
      : isActive
        ? theme.font.color.primary
        : theme.font.color.tertiary};
  cursor: pointer;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ isActive, theme }) =>
    isActive ? theme.font.weight.medium : theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(1)};

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
    color: ${({ hasError, theme }) =>
      hasError ? theme.color.red : theme.font.color.primary};
  }
`;

const StyledOutputArea = styled.div<{ isError?: boolean }>`
  background: ${({ theme }) => theme.background.tertiary};
  color: ${({ isError, theme }) =>
    isError ? theme.color.red : theme.font.color.primary};
  font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  font-size: ${({ theme }) => theme.font.size.sm};
  line-height: 1.5;
  max-height: 300px;
  min-height: 100px;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing(2)};
  white-space: pre-wrap;
  word-break: break-word;
`;

const StyledEmptyMessage = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-style: italic;
`;

const StyledCursor = styled.span`
  animation: blink 1s step-end infinite;
  background: ${({ theme }) => theme.font.color.primary};
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
