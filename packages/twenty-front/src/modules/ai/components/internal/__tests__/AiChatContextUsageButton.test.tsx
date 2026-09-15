import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiChatContextUsageButton } from '@/ai/components/internal/AiChatContextUsageButton';
import { type AgentChatUsageState } from '@/ai/states/agentChatUsageComponentFamilyState';

let mockUsage: AgentChatUsageState | null = null;
const mockUseQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue', () => ({
  useAtomStateValue: () => null,
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue',
  () => ({ useAtomComponentFamilyStateValue: () => mockUsage }),
);
jest.mock('@/ai/hooks/useAiModelTiers', () => ({
  useAiModelTiers: () => [
    { tier: 'balanced', model: { contextWindowTokens: 1000000 } },
  ],
}));
jest.mock('@/ai/hooks/useWorkspaceAiModelTiers', () => ({
  useWorkspaceAiModelTiers: () => ({ chatTier: 'balanced' }),
}));
jest.mock('@/ai/hooks/useIsWorkspaceSetupChat', () => ({
  useIsWorkspaceSetupChat: () => false,
}));
jest.mock('@/settings/usage/hooks/useUsageValueFormatter', () => ({
  useUsageValueFormatter: () => ({
    formatUsageValue: (value: number) => `${value} credits`,
  }),
}));

describe('AiChatContextUsageButton', () => {
  beforeEach(() => {
    mockUsage = null;
    mockUseQuery.mockReturnValue({
      data: {
        aiChatUsage: { limitValue: 1000, consumedValue: 800, periodEnd: null },
      },
      loading: false,
    });
  });

  it('shows the circle on a new chat and opens its context and credit usage', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Context and usage' }));
    expect(
      screen.getByRole('dialog', { name: 'Context and usage' }),
    ).toBeVisible();
    expect(screen.getByText('(0/1M) 0%')).toBeVisible();
    expect(screen.getByText('80%')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^More/ }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens from the keyboard and reveals existing conversation details', async () => {
    mockUsage = {
      conversationSize: 200000,
      contextWindowTokens: 1000000,
      inputTokens: 200000,
      cachedInputTokens: 75000,
      outputTokens: 40000,
      inputCredits: 80,
      outputCredits: 20,
      lastMessage: {
        inputTokens: 100000,
        outputTokens: 20000,
        cachedInputTokens: 50000,
        inputCredits: 40,
        outputCredits: 10,
      },
    };
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.tab();
    expect(screen.getByText('(200k/1M) 20%')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^More/ }));
    expect(screen.getByText('Last message')).toBeVisible();
    expect(screen.getByText('Conversation')).toBeVisible();
    expect(screen.getByText('100k')).toBeVisible();
    expect(screen.getByText('20k')).toBeVisible();
    expect(screen.getByText('200k')).toBeVisible();
    expect(screen.getByText('40k')).toBeVisible();
    expect(screen.getByText('100')).toBeVisible();
    expect(screen.getByText('50')).toBeVisible();
    expect(screen.getAllByText('Credits')).toHaveLength(2);
    expect(screen.queryByText('Cost index')).not.toBeInTheDocument();
    expect(screen.getAllByText('Cached input')).toHaveLength(2);
    expect(screen.getByText('50k')).toBeVisible();
    expect(screen.getByText('75k')).toBeVisible();
    expect(screen.getAllByText('Context window')).toHaveLength(1);
    const lessButton = screen.getByRole('button', { name: /^Less/ });
    expect(
      screen.getByText('100').compareDocumentPosition(lessButton) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    await user.click(lessButton);
    expect(screen.queryByText('Conversation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^More/ })).toBeVisible();
  });

  it('shows token counts without a context capacity and hides an absent last message', async () => {
    mockUsage = {
      conversationSize: 0,
      contextWindowTokens: 0,
      inputTokens: 1200,
      outputTokens: 300,
      inputCredits: 0,
      outputCredits: 0,
      lastMessage: null,
    };
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Context and usage' }));
    await user.click(screen.getByRole('button', { name: /^More/ }));
    expect(screen.getByText('1.2k')).toBeVisible();
    expect(screen.getByText('300')).toBeVisible();
    expect(screen.queryByText('Last message')).not.toBeInTheDocument();
    expect(screen.getByText('Conversation')).toBeVisible();
  });

  it('distinguishes missing usage from an empty balance', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        aiChatUsage: { limitValue: 1000, consumedValue: null, periodEnd: null },
      },
    });
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Context and usage' }));
    expect(screen.getByText('—')).toBeVisible();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('hides More when a chat has no usage data and no credit limit', async () => {
    mockUseQuery.mockReturnValue({ data: { aiChatUsage: null } });
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Context and usage' }));
    expect(screen.getByText('No limit')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /^More/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Conversation')).not.toBeInTheDocument();
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });

  it('shows a zero credit cap as exhausted', async () => {
    mockUseQuery.mockReturnValue({
      data: {
        aiChatUsage: { limitValue: 0, consumedValue: 0, periodEnd: null },
      },
    });
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <AiChatContextUsageButton />
      </I18nProvider>,
    );
    await user.click(screen.getByRole('button', { name: 'Context and usage' }));
    expect(screen.getByText('100%')).toBeVisible();
  });
});
