import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { NavigationDrawerAiChatThreadItem } from '@/ai/components/NavigationDrawerAiChatThreadItem';
import { NavigationDrawerAnimatedCollapseWrapper } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerAnimatedCollapseWrapper';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';
import { useNavigationSection } from '@/ui/navigation/navigation-drawer/hooks/useNavigationSection';
import { type AgentChatThread } from '~/generated-metadata/graphql';

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
`;

const StyledThreadList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['0.5']};
  padding-top: ${themeCssVariables.betweenSiblingsGap};
`;

export type NavigationDrawerAiChatThreadSectionProps = {
  sectionId: string;
  title: string;
  threads: AgentChatThread[];
  currentThreadId: string | null;
  onThreadClick: (thread: AgentChatThread) => void;
  rightIcon?: ReactNode;
  alwaysShowRightIcon?: boolean;
};

export const NavigationDrawerAiChatThreadSection = ({
  sectionId,
  title,
  threads,
  currentThreadId,
  onThreadClick,
  rightIcon,
  alwaysShowRightIcon = false,
}: NavigationDrawerAiChatThreadSectionProps) => {
  const { isNavigationSectionOpen, toggleNavigationSection } =
    useNavigationSection(sectionId);

  return (
    <StyledSection>
      <NavigationDrawerAnimatedCollapseWrapper>
        <NavigationDrawerSectionTitle
          label={title}
          onClick={toggleNavigationSection}
          alwaysShowRightIcon={alwaysShowRightIcon}
          isOpen={isNavigationSectionOpen}
          rightIcon={rightIcon}
        />
      </NavigationDrawerAnimatedCollapseWrapper>
      {threads.length > 0 ? (
        <AnimatedExpandableContainer
          isExpanded={isNavigationSectionOpen}
          dimension="height"
          mode="fit-content"
          containAnimation
          initial={false}
        >
          <StyledThreadList>
            {threads.map((thread) => (
              <NavigationDrawerAiChatThreadItem
                key={thread.id}
                thread={thread}
                isActive={currentThreadId === thread.id}
                onClick={onThreadClick}
              />
            ))}
          </StyledThreadList>
        </AnimatedExpandableContainer>
      ) : null}
    </StyledSection>
  );
};
