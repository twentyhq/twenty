import { PageLayoutRecordIdentifierBar } from '@/page-layout/components/PageLayoutRecordIdentifierBar';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';

const TARGET_RECORD_IDENTIFIER = {
  id: 'company-id',
  targetObjectNameSingular: 'company',
};

const PINNED_TAB = { id: 'pinned-tab-id', title: 'Tasks' };

let mockRecordCreatedAt: string | null = '2026-08-25T12:00:00.000Z';
const mockOpenTabSettings = jest.fn();

jest.mock(
  '@/object-record/record-show/components/RecordIdentifierBarTitle',
  () => ({
    RecordIdentifierBarTitle: () => <div>Google</div>,
  }),
);

jest.mock('@/page-layout/hooks/useOpenPageLayoutTabSettings', () => ({
  useOpenPageLayoutTabSettings: () => ({
    openTabSettings: mockOpenTabSettings,
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: () => mockRecordCreatedAt,
  }),
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>{children}</I18nProvider>
);

describe('PageLayoutRecordIdentifierBar', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-08-27T12:00:00.000Z'));
    mockRecordCreatedAt = '2026-08-25T12:00:00.000Z';
    mockOpenTabSettings.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('moves the creation date after the tabs only when no tab is pinned', () => {
    const { rerender } = render(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
        tabList={<div>Home</div>}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Google').parentElement).toContainElement(
      screen.getByText('Created 2 days ago'),
    );
    expect(screen.getByText('Home')).toBeVisible();

    rerender(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        tabList={<div>Home</div>}
      />,
    );

    const createdAt = screen.getByText('Created 2 days ago');

    expect(screen.getByText('Google').parentElement).not.toContainElement(
      createdAt,
    );
    expect(screen.getByText('Home').compareDocumentPosition(createdAt)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('keeps the pinned tab settings accessible beside the creation date', async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    const { rerender } = render(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
        isPinnedTabEditable
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Google').parentElement).toContainElement(
      screen.getByText('Created 2 days ago'),
    );

    expect(screen.queryByText('Tasks')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: 'Edit pinned tab: Tasks' }),
    );

    expect(mockOpenTabSettings).toHaveBeenCalledTimes(1);
    expect(mockOpenTabSettings).toHaveBeenCalledWith('pinned-tab-id');

    rerender(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
        isPinnedTabEditable={false}
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Edit pinned tab: Tasks' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Google').parentElement).toContainElement(
      screen.getByText('Created 2 days ago'),
    );
  });

  it('does not show pinned tab settings outside edit mode', () => {
    render(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
      />,
      { wrapper: Wrapper },
    );

    expect(
      screen.queryByRole('button', { name: 'Edit pinned tab: Tasks' }),
    ).not.toBeInTheDocument();
  });

  it('does not show pinned tab settings when no tab is pinned', () => {
    const { rerender } = render(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
        isPinnedTabEditable
      />,
      { wrapper: Wrapper },
    );

    expect(
      screen.getByRole('button', { name: 'Edit pinned tab: Tasks' }),
    ).toBeVisible();

    rerender(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        isPinnedTabEditable
      />,
    );

    expect(
      screen.queryByRole('button', { name: 'Edit pinned tab: Tasks' }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('Created 2 days ago')).toBeVisible();
  });

  it('renders the record header without a creation date', () => {
    mockRecordCreatedAt = null;

    render(
      <PageLayoutRecordIdentifierBar
        targetRecordIdentifier={TARGET_RECORD_IDENTIFIER}
        pinnedTab={PINNED_TAB}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Google')).toBeVisible();
    expect(screen.queryByText(/^Created /)).not.toBeInTheDocument();
  });
});
