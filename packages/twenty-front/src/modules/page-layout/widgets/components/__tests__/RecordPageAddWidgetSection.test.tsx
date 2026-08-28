import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockNavigateToMoreWidgets = jest.fn();
const mockCreateRecordPageNoteWidget = jest.fn();
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

  it('opens the existing picker from the compact row', async () => {
    render(<RecordPageAddWidgetSection isCompact />);
    await userEvent.setup().click(screen.getByText('Add widget'));
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Fields group')).not.toBeInTheDocument();
    expect(screen.queryByText('Note')).not.toBeInTheDocument();
  });

  it('retains the expanded chooser for empty tabs', () => {
    render(<RecordPageAddWidgetSection />);
    expect(screen.getByText('Fields group')).toBeInTheDocument();
    expect(screen.getByText('Field')).toBeInTheDocument();
    expect(screen.getByText('Note')).toBeInTheDocument();
    expect(screen.getByText('More widgets')).toBeInTheDocument();
  });

  it('creates a Note in the current tab through the shared creator', async () => {
    render(<RecordPageAddWidgetSection />);
    await userEvent.setup().click(screen.getByText('Note'));
    expect(mockCreateRecordPageNoteWidget).toHaveBeenCalledWith({
      tabId: 'tab-1',
    });
  });
});
