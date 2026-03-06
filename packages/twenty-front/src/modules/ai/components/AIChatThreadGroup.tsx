import { useAIChatThreadClick } from '@/ai/hooks/useAIChatThreadClick';
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
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  border-radius: ${themeCssVariables.border.radius.sm};
  transition: all 0.2s ease;
  margin-bottom: ${themeCssVariables.spacing[1]};
  border-left: 3px solid transparent;
  cursor: pointer;
  padding: ${themeCssVariables.spacing[1]} 1px;
  right: 3px;
  position: relative;
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
  padding: ${themeCssVariables.spacing[1]};
  justify-content: center;
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

export const AIChatThreadGroup = ({
  threads,
  title,
}: {
  threads: AgentChatThread[];
  title: string;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const { handleThreadClick } = useAIChatThreadClick();

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
