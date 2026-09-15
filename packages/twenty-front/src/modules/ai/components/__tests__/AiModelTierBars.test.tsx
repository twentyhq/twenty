import { render, screen } from '@testing-library/react';

import { AiModelTierBars } from '@/ai/components/AiModelTierBars';

describe('AiModelTierBars', () => {
  it('preserves the accessible button label', () => {
    render(<AiModelTierBars selectedTier="fast" label="Fast mode" />);

    expect(screen.getByRole('button', { name: 'Fast mode' })).toBeEnabled();
  });

  it('preserves the disabled state', () => {
    render(<AiModelTierBars selectedTier="fast" label="Fast mode" disabled />);

    expect(screen.getByRole('button', { name: 'Fast mode' })).toBeDisabled();
  });
});
