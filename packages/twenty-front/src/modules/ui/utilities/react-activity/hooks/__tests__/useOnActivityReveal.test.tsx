import { render } from '@testing-library/react';
import { Activity } from 'react';

import { useOnActivityReveal } from '@/ui/utilities/react-activity/hooks/useOnActivityReveal';

const RevealProbeEffect = ({ onReveal }: { onReveal: () => void }) => {
  useOnActivityReveal(onReveal);

  return null;
};

const RevealHarness = ({
  mode,
  onReveal,
}: {
  mode: 'visible' | 'hidden';
  onReveal: () => void;
}) => (
  <Activity mode={mode}>
    <RevealProbeEffect onReveal={onReveal} />
  </Activity>
);

describe('useOnActivityReveal', () => {
  it('does not fire on first mount', () => {
    const onReveal = jest.fn();

    render(<RevealHarness mode="visible" onReveal={onReveal} />);

    expect(onReveal).not.toHaveBeenCalled();
  });

  it('does not fire while hidden', () => {
    const onReveal = jest.fn();

    const { rerender } = render(
      <RevealHarness mode="visible" onReveal={onReveal} />,
    );

    rerender(<RevealHarness mode="hidden" onReveal={onReveal} />);

    expect(onReveal).not.toHaveBeenCalled();
  });

  it('fires each time the tree is revealed after being hidden', () => {
    const onReveal = jest.fn();

    const { rerender } = render(
      <RevealHarness mode="visible" onReveal={onReveal} />,
    );

    rerender(<RevealHarness mode="hidden" onReveal={onReveal} />);
    rerender(<RevealHarness mode="visible" onReveal={onReveal} />);

    expect(onReveal).toHaveBeenCalledTimes(1);

    rerender(<RevealHarness mode="hidden" onReveal={onReveal} />);
    rerender(<RevealHarness mode="visible" onReveal={onReveal} />);

    expect(onReveal).toHaveBeenCalledTimes(2);
  });

  it('fires when a tree prerendered hidden is revealed for the first time', () => {
    const onReveal = jest.fn();

    const { rerender } = render(
      <RevealHarness mode="hidden" onReveal={onReveal} />,
    );

    expect(onReveal).not.toHaveBeenCalled();

    rerender(<RevealHarness mode="visible" onReveal={onReveal} />);

    expect(onReveal).not.toHaveBeenCalled();
  });
});
