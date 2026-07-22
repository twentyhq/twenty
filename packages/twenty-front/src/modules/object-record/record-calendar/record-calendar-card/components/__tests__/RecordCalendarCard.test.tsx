import { fireEvent, render, screen } from '@testing-library/react';

import { RecordCalendarCard } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCard';

const mockOpenRecordFromIndexView = jest.fn();
const mockUseGetCurrentViewOnly = jest.fn();

jest.mock('@/views/hooks/useGetCurrentViewOnly', () => ({
  useGetCurrentViewOnly: () => mockUseGetCurrentViewOnly(),
}));
jest.mock(
  '@/object-record/record-index/hooks/useOpenRecordFromIndexView',
  () => ({
    useOpenRecordFromIndexView: () => ({
      openRecordFromIndexView: mockOpenRecordFromIndexView,
    }),
  }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyState',
  () => ({ useAtomComponentFamilyState: () => [false, jest.fn()] }),
);
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({ useAtomComponentStateValue: () => false }),
);
jest.mock(
  '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow',
  () => ({ useAvailableComponentInstanceIdOrThrow: () => 'calendar-id' }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => jest.fn(),
}));
jest.mock('@/ui/layout/dropdown/hooks/useOpenDropdown', () => ({
  useOpenDropdown: () => ({ openDropdown: jest.fn() }),
}));
jest.mock(
  '@/object-record/record-field-list/contexts/RecordFieldsScopeContext',
  () => ({
    RecordFieldsScopeContextProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => children,
  }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellHoveredPortal',
  () => ({ RecordCalendarCardCellHoveredPortal: () => null }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/anchored-portal/components/RecordCalendarCardCellEditModePortal',
  () => ({ RecordCalendarCardCellEditModePortal: () => null }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardHeader',
  () => ({
    RecordCalendarCardHeader: () => <div data-testid="card-header" />,
  }),
);
jest.mock(
  '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardBody',
  () => ({
    RecordCalendarCardBody: () => <div data-testid="card-body" />,
  }),
);
jest.mock('@/object-record/record-card/components/RecordCard', () => ({
  RecordCard: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
  }) => (
    <button data-testid="record-card" onClick={onClick}>
      {children}
    </button>
  ),
}));
jest.mock('twenty-ui/layout', () => ({
  AnimatedEaseInOut: ({
    children,
    isOpen,
  }: {
    children: React.ReactNode;
    isOpen: boolean;
  }) => (isOpen ? children : null),
}));

describe('RecordCalendarCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the full card body without making the whole card clickable', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: { isCompact: false },
    });

    render(<RecordCalendarCard recordId="record-id" />);

    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.getByTestId('card-body')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('record-card'));

    expect(mockOpenRecordFromIndexView).not.toHaveBeenCalled();
  });

  it('hides the body and makes the whole compact card clickable', () => {
    mockUseGetCurrentViewOnly.mockReturnValue({
      currentView: { isCompact: true },
    });

    render(<RecordCalendarCard recordId="record-id" />);

    expect(screen.getByTestId('card-header')).toBeInTheDocument();
    expect(screen.queryByTestId('card-body')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('record-card'));

    expect(mockOpenRecordFromIndexView).toHaveBeenCalledWith({
      recordId: 'record-id',
    });
  });
});
