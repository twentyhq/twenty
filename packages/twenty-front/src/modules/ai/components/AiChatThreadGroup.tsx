import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { IconSparkles } from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledThreadsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDateGroup = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledDateHeader = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledThreadItem = styled.div<{ isSelected?: boolean }>`
  align-items: center;
  border-left: 3px solid transparent;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} 1px;
  position: relative;
  right: 3px;
  transition: all 0.2s ease;
  width: calc(100% + 1px);

  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledSparkleIcon = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.blue};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  justify-content: center;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledThreadContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledThreadTitle = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AiChatThreadGroup = ({
  threads,
  title,
}: {
  threads: AgentChatThread[];
  title: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { handleThreadClick } = useAiChatThreadClick();

  if (threads.length === 0) {
    return null;
  }

  return (
    <StyledDateGroup>
      <StyledDateHeader>{title}</StyledDateHeader>
      <StyledThreadsList>
        {threads.map((thread) => (
          <StyledThreadItem
            onClick={() => handleThreadClick(thread)}
            key={thread.id}
          >
            <StyledSparkleIcon>
              <IconSparkles
                size={theme.icon.size.md}
                color={theme.color.blue}
              />
            </StyledSparkleIcon>
            <StyledThreadContent>
              <StyledThreadTitle>
                {thread.title || t`Untitled`}
              </StyledThreadTitle>
            </StyledThreadContent>
          </StyledThreadItem>
        ))}
      </StyledThreadsList>
    </StyledDateGroup>
  );
};
