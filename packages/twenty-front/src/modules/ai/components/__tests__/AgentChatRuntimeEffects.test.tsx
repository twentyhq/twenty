import { render } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

jest.mock('@/ai/components/AgentChatMessagesFetchEffect', () => ({
  AgentChatMessagesFetchEffect: () => <div data-testid="messages-fetch" />,
}));
jest.mock('@/ai/components/AgentChatStreamSubscriptionEffect', () => ({
  AgentChatStreamSubscriptionEffect: () => (
    <div data-testid="stream-subscription" />
  ),
}));
jest.mock('@/ai/components/AgentChatPrepromptEffect', () => ({
  AgentChatPrepromptEffect: () => <div data-testid="preprompt" />,
}));
jest.mock('@/ai/components/AgentChatStreamKeepAliveEffect', () => ({
  AgentChatStreamKeepAliveEffect: () => <div data-testid="keep-alive" />,
}));
jest.mock('@/ai/components/AgentChatSessionStartTimeEffect', () => ({
  AgentChatSessionStartTimeEffect: () => <div data-testid="session-start" />,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('AgentChatRuntimeEffects', () => {
  beforeEach(() => {
    resetJotaiStore();
  });

  it('should render nothing until the chat has been opened once', () => {
    const { container } = render(<AgentChatRuntimeEffects />, {
      wrapper: Wrapper,
    });

    expect(container).toBeEmptyDOMElement();
  });

  it('should run the chat runtime once the chat has been opened, regardless of the side panel', () => {
    jotaiStore.set(hasAgentChatBeenOpenedState.atom, true);

    const { getByTestId } = render(<AgentChatRuntimeEffects />, {
      wrapper: Wrapper,
    });

    expect(getByTestId('messages-fetch')).toBeInTheDocument();
    expect(getByTestId('stream-subscription')).toBeInTheDocument();
    expect(getByTestId('preprompt')).toBeInTheDocument();
    expect(getByTestId('keep-alive')).toBeInTheDocument();
    expect(getByTestId('session-start')).toBeInTheDocument();
  });
});
