import { RecordPageAddWidgetSection } from '@/page-layout/widgets/components/RecordPageAddWidgetSection';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type * as TwentyIcons from 'twenty-ui/icon';

const mockNavigateToMoreWidgets = jest.fn();
const mockCreateRecordPageNoteWidget = jest.fn(() => ({ id: 'new-note' }));
const mockCreateRecordPageFieldWidget = jest.fn(() => ({ id: 'new-field' }));
const mockCreateRecordPageFieldsWidget = jest.fn(() => ({ id: 'new-fields' }));
const mockInsertCreatedWidgetAtContext = jest.fn();

jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual<typeof TwentyIcons>('twenty-ui/icon'),
  IconListDetails: () => <svg role="img" aria-label="Fields group icon" />,
  IconListSearch: () => <svg role="img" aria-label="Field icon" />,
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
    createRecordPageFieldWidget: mockCreateRecordPageFieldWidget,
  }),
}));
jest.mock('@/page-layout/hooks/useCreateRecordPageFieldsWidget', () => ({
  useCreateRecordPageFieldsWidget: () => ({
    createRecordPageFieldsWidget: mockCreateRecordPageFieldsWidget,
  }),
}));

jest.mock('@/page-layout/hooks/useInsertCreatedWidgetAtContext', () => ({
  useInsertCreatedWidgetAtContext: () => ({
    insertCreatedWidgetAtContext: mockInsertCreatedWidgetAtContext,
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
    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith(null);
  });

  it('shows the expanded chooser', () => {
    render(<RecordPageAddWidgetSection />);
    expect(screen.getByText('Add widget')).toBeInTheDocument();
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
    expect(mockInsertCreatedWidgetAtContext).toHaveBeenCalledWith(
      'new-note',
      null,
    );
  });

  it.each([
    ['Fields group', 'new-fields'],
    ['Field', 'new-field'],
    ['Note', 'new-note'],
  ])(
    'inserts %s at the expanded chooser insertion point',
    async (label, widgetId) => {
      const insertionContext = {
        targetWidgetId: 'first-widget',
        direction: 'above',
      } as const;
      render(
        <RecordPageAddWidgetSection insertionContext={insertionContext} />,
      );

      await userEvent.setup().click(screen.getByText(label, { exact: true }));

      expect(mockInsertCreatedWidgetAtContext).toHaveBeenCalledWith(
        widgetId,
        insertionContext,
      );
    },
  );

  it('preserves the insertion point when opening More widgets', async () => {
    const insertionContext = {
      targetWidgetId: 'first-widget',
      direction: 'above',
    } as const;
    render(<RecordPageAddWidgetSection insertionContext={insertionContext} />);

    await userEvent.setup().click(screen.getByText('More widgets'));

    expect(mockNavigateToMoreWidgets).toHaveBeenCalledWith(insertionContext);
  });
});
