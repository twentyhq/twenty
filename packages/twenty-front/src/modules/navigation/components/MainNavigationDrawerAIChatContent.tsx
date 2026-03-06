import { styled } from '@linaria/react';

import { NavigationDrawerai-chat-threadsList } from '@/ai/components/NavigationDrawerai-chat-threadsList';

const Styledai-chat-threadsListWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

export const MainNavigationDrawerAIChatContent = () => {
  return (
    <Styledai-chat-threadsListWrapper>
      <NavigationDrawerai-chat-threadsList />
    </Styledai-chat-threadsListWrapper>
  );
};
