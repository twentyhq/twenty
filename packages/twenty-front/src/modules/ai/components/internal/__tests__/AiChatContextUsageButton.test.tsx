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
jest.mock('@/ai/components/internal/AiChatContextUsageDetails', () => ({
  AiChatContextUsageDetails: () => <div>Conversation details</div>,
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
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens from the keyboard and reveals existing conversation details', async () => {
    mockUsage = {
      conversationSize: 200000,
      contextWindowTokens: 1000000,
      inputTokens: 0,
      outputTokens: 0,
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
    await user.tab();
    expect(screen.getByText('(200k/1M) 20%')).toBeVisible();
    await user.click(screen.getByRole('button', { name: /^More/ }));
    expect(screen.getByText('Conversation details')).toBeVisible();
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
