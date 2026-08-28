import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as TwentyIcons from 'twenty-ui/icon';

const mockNavigateToMoreWidgets = jest.fn();
const mockCreateRecordPageNoteWidget = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconStack2: () => <svg role="img" aria-label="Fields group icon" />,
  IconListDetails: () => <svg role="img" aria-label="Field icon" />,
  IconNotes: () => <svg role="img" aria-label="Note icon" />,
}));

jest.mock('@/page-layout/contexts/PageLayoutContentContext', () => ({
  usePageLayoutContentContext: () => ({ tabId: 'tab-1' }),
}));

jest.mock('@/page-layout/hooks/useNavigateToMoreWidgets', () => ({
  useNavigateToMoreWidgets: () => ({
    navigateToMoreWidgets: mockNavigateToMoreWidgets,
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
jest.mock('@/page-layout/hooks/useCreateRecordPageNoteWidget', () => ({
  useCreateRecordPageNoteWidget: () => ({
    createRecordPageNoteWidget: mockCreateRecordPageNoteWidget,
  }),
}));

describe('RecordPageAddWidgetSection', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the existing picker from More widgets', async () => {
    render(<RecordPageAddWidgetSection />);
    await userEvent.setup().click(screen.getByText('More widgets'));
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledTimes(1);
  });

  it('shows the expanded chooser', () => {
    render(<RecordPageAddWidgetSection />);
    expect(screen.getByText('Fields group')).toBeInTheDocument();
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('More widgets')).toBeInTheDocument();
    expect(
      screen.getByRole('img', { name: 'Fields group icon' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Field icon' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Note icon' })).toBeInTheDocument();
  });

  it('creates a Note in the current tab through the shared creator', async () => {
    render(<RecordPageAddWidgetSection />);
    await userEvent.setup().click(screen.getByText('Note'));
    expect(mockCreateRecordPageNoteWidget).toHaveBeenCalledWith({
      tabId: 'tab-1',
    });
  });
});
