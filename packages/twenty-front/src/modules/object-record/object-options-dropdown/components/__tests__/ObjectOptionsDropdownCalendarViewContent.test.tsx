import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';
import { ObjectOptionsDropdownCalendarFieldsContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCalendarFieldsContent';

import { ObjectOptionsDropdownCalendarViewContent } from '@/object-record/object-options-dropdown/components/ObjectOptionsDropdownCalendarViewContent';
import { ViewCalendarLayout } from '~/generated-metadata/graphql';

const mockCalendarFields = [
  { id: 'date-field', label: 'Due date', type: 'DATE' },
  { id: 'date-time-field', label: 'Created at', type: 'DATE_TIME' },
];
const mockSetCalendarField = jest.fn();

jest.mock('@/views/view-picker/hooks/useGetAvailableFieldsForCalendar', () => ({
  useGetAvailableFieldsForCalendar: () => ({
    availableFieldsForCalendar: mockCalendarFields,
    navigateToDateFieldSettings: jest.fn(),
  }),
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => ['date-field', mockSetCalendarField],
}));
jest.mock('twenty-ui/icon', () => ({
  ...jest.requireActual('twenty-ui/icon'),
  useIcons: () => ({ getIcon: () => () => null }),
}));

const mockCloseDropdown = jest.fn();
const mockResetContent = jest.fn();
const mockSetRecordIndexCalendarLayout = jest.fn();
const mockUpdateCurrentView = jest.fn();
const mockUseCalendarLayoutValue = jest.fn();

jest.mock(
  '@/object-record/object-options-dropdown/hooks/useObjectOptionsDropdown',
  () => ({
    useObjectOptionsDropdown: jest.fn(() => ({
      objectMetadataItem: { fields: mockCalendarFields },
      closeDropdown: mockCloseDropdown,
      resetContent: mockResetContent,
    })),
  }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownContent', () => ({
  DropdownContent: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader',
  () => ({
    DropdownMenuHeader: ({ children }: { children: React.ReactNode }) =>
      children,
  }),
);
jest.mock(
  '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent',
  () => ({ DropdownMenuHeaderLeftComponent: () => null }),
);
jest.mock('@/ui/layout/dropdown/components/DropdownMenuItemsContainer', () => ({
  DropdownMenuItemsContainer: ({ children }: { children: React.ReactNode }) =>
    children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableList', () => ({
  SelectableList: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@/ui/layout/selectable-list/components/SelectableListItem', () => ({
  SelectableListItem: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (state: unknown) => {
      const { recordIndexCalendarLayoutComponentState } = jest.requireActual(
        '@/object-record/record-index/states/recordIndexCalendarLayoutComponentState',
      );

      return state === recordIndexCalendarLayoutComponentState
        ? mockUseCalendarLayoutValue()
        : null;
    },
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: jest.fn(() => mockSetRecordIndexCalendarLayout),
}));
jest.mock('@/views/hooks/useUpdateCurrentView', () => ({
  useUpdateCurrentView: jest.fn(() => ({
    updateCurrentView: mockUpdateCurrentView,
  })),
}));
jest.mock('twenty-ui/data-display', () => ({
  Pill: ({ label }: { label: string }) => <span>{label}</span>,
}));
jest.mock('twenty-ui/navigation', () => ({
  MenuItem: ({ text }: { text: string }) => <span>{text}</span>,
  MenuItemSelect: ({
    contextualText,
    disabled,
    onClick,
    selected,
    text,
  }: {
    contextualText?: React.ReactNode;
    disabled?: boolean;
    onClick?: () => void;
    selected: boolean;
    text: string;
  }) => (
    <button data-selected={selected} disabled={disabled} onClick={onClick}>
      <span>{text}</span>
      {contextualText}
    </button>
  ),
}));

describe('ObjectOptionsDropdownCalendarViewContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseCalendarLayoutValue.mockReturnValue(ViewCalendarLayout.MONTH);
    mockUpdateCurrentView.mockResolvedValue(undefined);
  });

  it('offers Day, Week, and Month while keeping Timeline disabled', () => {
    render(<ObjectOptionsDropdownCalendarViewContent />);

    expect(
      screen
        .getAllByRole('button')
        .map((button) => button.textContent?.replace('Soon', '')),
    ).toEqual(['Day', 'Week', 'Month', 'Timeline']);
    expect(screen.getByText('Day').closest('button')).toBeEnabled();
    expect(screen.getByText('Timeline').closest('button')).toBeDisabled();
  });

  it.each([
    ['Day', ViewCalendarLayout.DAY],
    ['Week', ViewCalendarLayout.WEEK],
  ])('persists %s without a feature flag', async (label, calendarLayout) => {
    const user = userEvent.setup();
    render(<ObjectOptionsDropdownCalendarViewContent />);

    await user.click(screen.getByRole('button', { name: label }));

    expect(mockSetRecordIndexCalendarLayout).toHaveBeenCalledWith(
      calendarLayout,
    );
    expect(mockUpdateCurrentView).toHaveBeenCalledWith({ calendarLayout });
    await waitFor(() => expect(mockCloseDropdown).toHaveBeenCalled());
  });
});

describe('ObjectOptionsDropdownCalendarFieldsContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdateCurrentView.mockResolvedValue(undefined);
  });

  it.each(mockCalendarFields)(
    'selects $label directly and clears legacy end-field configuration',
    async ({ id, label }) => {
      const user = userEvent.setup();
      render(
        <I18nProvider i18n={i18n}>
          <ObjectOptionsDropdownCalendarFieldsContent />
        </I18nProvider>,
      );

      expect(
        screen.getByRole('button', { name: 'Due date' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Created at' }),
      ).toBeInTheDocument();
      expect(screen.queryByText('End date field')).not.toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: label }));

      expect(mockSetCalendarField).toHaveBeenCalledWith(id);
      expect(mockUpdateCurrentView).toHaveBeenCalledWith({
        calendarFieldMetadataId: id,
        calendarEndFieldMetadataId: null,
      });
      expect(mockCloseDropdown).toHaveBeenCalled();
    },
  );

  it('searches Date and DateTime fields in the same picker', async () => {
    const user = userEvent.setup();
    render(
      <I18nProvider i18n={i18n}>
        <ObjectOptionsDropdownCalendarFieldsContent />
      </I18nProvider>,
    );

    await user.type(screen.getByPlaceholderText('Search fields'), 'created');

    expect(
      screen.queryByRole('button', { name: 'Due date' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Created at' }),
    ).toBeInTheDocument();
  });
});
