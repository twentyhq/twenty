import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as TwentyIcons from 'twenty-ui/icon';

const mockCreateRecordPageNoteWidget = jest.fn();
const mockNavigateToMoreWidgets = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconNotes: () => <svg role="img" aria-label="Note icon" />,
}));

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({ tabId: 'tab-1' }),
}));

jest.mock('@/page-layout/hooks/useCreateRecordPageNoteWidget', () => ({
  useCreateRecordPageNoteWidget: () => ({
    createRecordPageNoteWidget: mockCreateRecordPageNoteWidget,
  }),
}));

jest.mock('@/page-layout/hooks/useCreateRecordPageFieldWidget', () => ({
  useCreateRecordPageFieldWidget: () => ({
    createRecordPageFieldWidget: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useCreateRecordPageFieldsWidget', () => ({
  useCreateRecordPageFieldsWidget: () => ({
    createRecordPageFieldsWidget: jest.fn(),
  }),
}));

jest.mock('@/page-layout/hooks/useNavigateToMoreWidgets', () => ({
  useNavigateToMoreWidgets: () => ({
    navigateToMoreWidgets: mockNavigateToMoreWidgets,
  }),
}));

describe('RecordPageAddWidgetSection Note', () => {
  beforeEach(() => jest.clearAllMocks());

  it('explains that a Note is static text shared across record pages', () => {
    render(<RecordPageAddWidgetSection />);

    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(
      screen.getByText('· Static text shared across all record pages'),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Note icon' })).toBeInTheDocument();
  });

  it('creates a Note in the current tab through the shared creator', async () => {
    render(<RecordPageAddWidgetSection />);

    await userEvent.setup().click(screen.getByText('Note', { exact: true }));

    expect(mockCreateRecordPageNoteWidget).toHaveBeenCalledWith({
      tabId: 'tab-1',
    });
  });

  it('keeps the existing More widgets picker available', async () => {
    render(<RecordPageAddWidgetSection />);

    await userEvent.setup().click(screen.getByText('More widgets'));

    expect(mockNavigateToMoreWidgets).toHaveBeenCalledTimes(1);
    expect(mockCreateRecordPageNoteWidget).not.toHaveBeenCalled();
  });
});
