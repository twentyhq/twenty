import { styled } from '@linaria/react';

import { NavigationDrawerAIChatThreadsList } from '@/ai/components/NavigationDrawerAIChatThreadsList';

const StyledAIChatThreadsListWrapper = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

export const MainNavigationDrawerAIChatContent = () => {
  return (
    <StyledAIChatThreadsListWrapper>
      <NavigationDrawerAIChatThreadsList />
    </StyledAIChatThreadsListWrapper>
  );
};
