import { TerminalOutput } from '@/ai/components/TerminalOutput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import {
  IconChevronDown,
  IconChevronUp,
  IconCode,
  IconCopy,
  IconDownload,
  IconFile,
  IconPlayerPlay,
  IconSquareRoundedCheck,
  IconSquareRoundedX,
} from 'twenty-ui/display';
import { CodeEditor, LightIconButton } from 'twenty-ui/input';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  margin: ${({ theme }) => theme.spacing(2)} 0;
  overflow: hidden;
`;

const StyledHeader = styled.div<{ status: 'success' | 'error' | 'running' }>`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledHeaderRight = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledStatusBadge = styled.div<{
  status: 'success' | 'error' | 'running';
}>`
  align-items: center;
  background: ${({ status, theme }) =>
    status === 'success'
      ? theme.background.transparent.success
      : status === 'error'
        ? theme.background.transparent.danger
        : theme.background.transparent.medium};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ status, theme }) =>
    status === 'success'
      ? theme.color.turquoise
      : status === 'error'
        ? theme.color.red
        : theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(0.5)}
    ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const StyledSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  transition: background ${({ theme }) => theme.animation.duration.fast}s;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

const StyledSectionHeaderLeft = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledCodeEditorContainer = styled.div`
  max-height: 300px;
  overflow: hidden;
`;

const StyledFilesGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(2)};
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledFileCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const StyledFilePreview = styled.div`
  align-items: center;
  aspect-ratio: 16 / 9;
  background: ${({ theme }) => theme.background.tertiary};
  display: flex;
  justify-content: center;
  overflow: hidden;
`;

const StyledPreviewImage = styled.img`
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

const StyledFileInfo = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(1.5)}
    ${({ theme }) => theme.spacing(2)};
`;

const StyledFileName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDownloadLink = styled.a`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;

  &:hover {
    color: ${({ theme }) => theme.font.color.primary};
  }
`;

type CodeExecutionDisplayProps = {
  code: string;
  stdout: string;
  stderr: string;
  exitCode?: number;
  files?: Array<{
    filename: string;
    url: string;
    mimeType?: string;
  }>;
  isRunning?: boolean;
};

const isPreviewableMimeType = (mimeType?: string): boolean => {
  if (!mimeType) {
    return false;
  }

  return ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(
    mimeType,
  );
};

export const CodeExecutionDisplay = ({
  code,
  stdout,
  stderr,
  exitCode,
  files = [],
  isRunning = false,
}: CodeExecutionDisplayProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { copyToClipboard } = useCopyToClipboard();
  const [isCodeExpanded, setIsCodeExpanded] = useState(false);
  const [isOutputExpanded, setIsOutputExpanded] = useState(true);
  const [isFilesExpanded, setIsFilesExpanded] = useState(true);

  const status: 'success' | 'error' | 'running' = isRunning
    ? 'running'
    : exitCode === 0
      ? 'success'
      : 'error';

  const StatusIcon =
    status === 'success'
      ? IconSquareRoundedCheck
      : status === 'error'
        ? IconSquareRoundedX
        : IconPlayerPlay;

  const statusText = isRunning
    ? t`Running...`
    : exitCode === 0
      ? t`Completed`
      : t`Failed`;

  const hasOutput = stdout || stderr;
  const hasFiles = files.length > 0;

  return (
    <StyledContainer>
      <StyledHeader status={status}>
        <StyledHeaderLeft>
          <IconCode size={theme.icon.size.md} />
          <StyledTitle>{t`Python Code Execution`}</StyledTitle>
        </StyledHeaderLeft>
        <StyledHeaderRight>
          <StyledStatusBadge status={status}>
            <StatusIcon size={theme.icon.size.sm} />
            {statusText}
          </StyledStatusBadge>
        </StyledHeaderRight>
      </StyledHeader>

      <StyledSection>
        <StyledSectionHeader onClick={() => setIsCodeExpanded(!isCodeExpanded)}>
          <StyledSectionHeaderLeft>
            <IconCode size={theme.icon.size.sm} />
            {t`Code`}
          </StyledSectionHeaderLeft>
          <StyledHeaderRight>
            <LightIconButton
              Icon={IconCopy}
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(code);
              }}
              title={t`Copy code`}
              size="small"
              accent="tertiary"
            />
            {isCodeExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledHeaderRight>
        </StyledSectionHeader>
        <AnimatedExpandableContainer
          isExpanded={isCodeExpanded}
          mode="fit-content"
        >
          <StyledCodeEditorContainer>
            <CodeEditor
              value={code}
              language="python"
              height="300px"
              options={{
                readOnly: true,
                domReadOnly: true,
                minimap: { enabled: false },
              }}
            />
          </StyledCodeEditorContainer>
        </AnimatedExpandableContainer>
      </StyledSection>

      {(hasOutput || isRunning) && (
        <StyledSection>
          <StyledSectionHeader
            onClick={() => setIsOutputExpanded(!isOutputExpanded)}
          >
            <StyledSectionHeaderLeft>{t`Output`}</StyledSectionHeaderLeft>
            {isOutputExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledSectionHeader>
          <AnimatedExpandableContainer
            isExpanded={isOutputExpanded}
            mode="fit-content"
          >
            <TerminalOutput
              stdout={stdout}
              stderr={stderr}
              isRunning={isRunning}
            />
          </AnimatedExpandableContainer>
        </StyledSection>
      )}

      {hasFiles && (
        <StyledSection>
          <StyledSectionHeader
            onClick={() => setIsFilesExpanded(!isFilesExpanded)}
          >
            <StyledSectionHeaderLeft>
              <IconFile size={theme.icon.size.sm} />
              {t`Generated Files`} ({files.length})
            </StyledSectionHeaderLeft>
            {isFilesExpanded ? (
              <IconChevronUp size={theme.icon.size.sm} />
            ) : (
              <IconChevronDown size={theme.icon.size.sm} />
            )}
          </StyledSectionHeader>
          <AnimatedExpandableContainer
            isExpanded={isFilesExpanded}
            mode="fit-content"
          >
            <StyledFilesGrid>
              {files.map((file) => {
                const filename = file.filename;

                return (
                  <StyledFileCard key={file.url}>
                    <StyledFilePreview>
                      {isPreviewableMimeType(file.mimeType) ? (
                        <StyledPreviewImage
                          src={file.url}
                          alt={filename}
                          loading="lazy"
                        />
                      ) : (
                        <IconFile size={48} color={theme.font.color.tertiary} />
                      )}
                    </StyledFilePreview>
                    <StyledFileInfo>
                      <StyledFileName title={filename}>
                        {filename}
                      </StyledFileName>
                      <StyledDownloadLink
                        href={file.url}
                        download={filename}
                        title={t`Download ${filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <IconDownload size={theme.icon.size.sm} />
                      </StyledDownloadLink>
                    </StyledFileInfo>
                  </StyledFileCard>
                );
              })}
            </StyledFilesGrid>
          </AnimatedExpandableContainer>
        </StyledSection>
      )}
    </StyledContainer>
  );
};
