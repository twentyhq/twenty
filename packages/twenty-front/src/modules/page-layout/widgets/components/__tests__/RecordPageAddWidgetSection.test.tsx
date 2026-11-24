import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigateToMoreWidgets = jest.fn();

jest.mock('@/page-layout/hooks/useNavigateToMoreWidgets', () => ({
  useNavigateToMoreWidgets: () => ({
    navigateToMoreWidgets: mockNavigateToMoreWidgets,
  }),
}));

describe('RecordPageAddWidgetSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the widget picker', async () => {
    render(<RecordPageAddWidgetSection />);

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Add widget' }));

    expect(mockNavigateToMoreWidgets).toHaveBeenCalledTimes(1);
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith(null);
  });

  it('opens the picker for the slot it was placed in', async () => {
    const insertionContext = {
      targetWidgetId: 'widget-id',
      direction: 'above' as const,
    };

    render(<RecordPageAddWidgetSection insertionContext={insertionContext} />);

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Add widget' }));

    expect(mockNavigateToMoreWidgets).toHaveBeenCalledTimes(1);
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith(insertionContext);
  });
});
