import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { type ReactNode } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AiModelTierInformationButton } from '@/ai/components/AiModelTierInformationButton';
import { type ResolvedAiModelTier } from '@/ai/types/ResolvedAiModelTier';

const resolvedTier: ResolvedAiModelTier = {
  tier: 'smart',
  label: 'Smart',
  model: {
    modelId: 'test',
    label: 'Test model (high reasoning)',
    effort: 'high',
  },
  isPinned: false,
  intelligenceDeltaPercent: 40,
  speedDeltaPercent: 12,
  costDeltaPercent: 2300,
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('AiModelTierInformationButton', () => {
  it('shows explicit comparisons on hover and dismisses with Escape', async () => {
    const user = userEvent.setup();
    render(<AiModelTierInformationButton resolvedTier={resolvedTier} />, {
      wrapper,
    });

    expect(screen.queryByText('×24')).not.toBeInTheDocument();
    await user.hover(screen.getByRole('button', { name: 'Model information' }));

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('Test model')).toBeInTheDocument();
    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Vs Balanced mode')).toBeInTheDocument();
    expect(screen.getByText('+40%')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('×24')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('tooltip')).not.toBeInTheDocument(),
    );
  });

  it('opens on keyboard focus and preserves measured zero comparisons', async () => {
    const user = userEvent.setup();
    render(
      <AiModelTierInformationButton
        resolvedTier={{
          ...resolvedTier,
          intelligenceDeltaPercent: 0,
          speedDeltaPercent: undefined,
          costDeltaPercent: 0,
        }}
      />,
      { wrapper },
    );

    await user.tab();

    expect(await screen.findByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('×1')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });
});
