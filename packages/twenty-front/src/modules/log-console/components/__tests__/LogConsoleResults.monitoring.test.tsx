import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LogConsoleResults } from '@/log-console/components/LogConsoleResults';
import { type LogConsoleFilter } from '@/log-console/types/LogConsoleFilter';
import { type LogConsoleSource } from '@/log-console/types/LogConsoleSource';
import { useEventLogsLiveStream } from '@/settings/event-logs/hooks/useEventLogsLiveStream';
import { useEventLogs } from '@/settings/event-logs/hooks/useQueryEventLogs';
import {
  EventLogFilterOperand,
  EventLogTable,
} from '~/generated-metadata/graphql';

jest.mock('@/log-console/states/logConsoleFiltersState', () => ({
  logConsoleFiltersState: 'filters',
}));
jest.mock('@/log-console/states/logConsoleSelectedLogState', () => ({
  logConsoleSelectedLogState: 'selected',
}));
jest.mock('@/log-console/states/logConsoleTimeRangeState', () => ({
  logConsoleTimeRangeState: 'range',
}));
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomState', () => {
  const { useState } = jest.requireActual('react');
  return {
    useAtomState: (state: string) =>
      useState(
        state === 'filters'
          ? [{ filterFieldId: 'app', operand: 'IS', values: ['owned-app'] }]
          : state === 'range'
            ? '24h'
            : null,
      ),
  };
});
jest.mock('@/log-console/hooks/useLogConsoleRetention', () => ({
  useLogConsoleRetention: () => ({ retentionInHours: 168 }),
}));
jest.mock('@/log-console/hooks/useLogConsoleTimeZone', () => ({
  useLogConsoleTimeZone: () => 'UTC',
}));
jest.mock('@/log-console/utils/getLogConsoleTimeRangeWithinRetention', () => ({
  getLogConsoleTimeRangeWithinRetention: ({
    timeRange,
  }: {
    timeRange: string;
  }) => timeRange,
}));
jest.mock('@/log-console/utils/getLogConsoleTimeRangeBounds', () => ({
  getLogConsoleTimeRangeBounds: () => ({ start: '2026-10-15T00:00:00.000Z' }),
}));
jest.mock('@/ui/utilities/scroll/hooks/useScrollWrapperHTMLElement', () => ({
  useScrollWrapperHTMLElement: () => ({ getScrollWrapperElement: () => ({}) }),
}));
jest.mock('@/settings/event-logs/hooks/useQueryEventLogs', () => ({
  useEventLogs: jest.fn(),
}));
jest.mock('@/settings/event-logs/hooks/useEventLogsLiveStream', () => ({
  useEventLogsLiveStream: jest.fn(),
}));
jest.mock('@/settings/components/SettingsEmptyPlaceholder', () => ({
  SettingsEmptyPlaceholder: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));
jest.mock('@/settings/components/SettingsTableTextCell', () => ({
  SettingsTableTextCell: ({ text }: { text: string }) => <span>{text}</span>,
}));
jest.mock('@/log-console/components/LogConsoleTimeRangeDropdown', () => ({
  LogConsoleTimeRangeDropdown: () => <button>Last 24 hours</button>,
}));
jest.mock('@/log-console/components/LogConsoleActivity', () => ({
  LogConsoleActivity: ({
    onSelectionChange,
  }: {
    onSelectionChange: (selection: { start: string; end: string }) => void;
  }) => (
    <button
      onClick={() =>
        onSelectionChange({
          start: '2026-10-16T00:00:00.000Z',
          end: '2026-10-16T00:01:15.000Z',
        })
      }
    >
      Select bucket
    </button>
  ),
}));
jest.mock('@/log-console/components/LogConsoleTable', () => ({
  LogConsoleTable: () => <div>Logs table</div>,
}));
jest.mock('@/log-console/components/LogConsoleToolbar', () => ({
  LogConsoleToolbar: ({
    children,
    onFiltersChange,
  }: {
    children: React.ReactNode;
    onFiltersChange: (filters: LogConsoleFilter[]) => void;
  }) => (
    <div>
      <button
        onClick={() =>
          onFiltersChange([
            {
              filterFieldId: 'app',
              operand: EventLogFilterOperand.IS,
              values: ['other-app'],
            },
          ])
        }
      >
        Change app
      </button>
      {children}
    </div>
  ),
}));

beforeAll(() => {
  if (!window.PointerEvent)
    Object.defineProperty(window, 'PointerEvent', {
      value: MouseEvent,
      configurable: true,
    });
});

const i18n = setupI18n({ locale: 'en', messages: { en: {} } });
const source = {
  id: 'app-logs',
  table: EventLogTable.APPLICATION_LOG,
  columns: [],
  filterFields: [{ id: 'app', serverField: 'applicationId' }],
} as unknown as LogConsoleSource;
const mockedUseEventLogs = jest.mocked(useEventLogs);
const mockedUseLive = jest.mocked(useEventLogsLiveStream);

const mount = () =>
  render(
    <I18nProvider i18n={i18n}>
      <LogConsoleResults source={source} />
    </I18nProvider>,
  );

describe('App logs monitoring integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedUseEventLogs.mockImplementation(
      (input) =>
        ({
          records: [],
          totalCount: 0,
          hasNextPage: false,
          loading: false,
          error: undefined,
          loadMore: jest.fn(),
          refetch: jest.fn(),
          canQueryInstanceLevel:
            input.filters?.fieldFilters?.[0]?.values.includes('owned-app') ??
            false,
        }) as unknown as ReturnType<typeof useEventLogs>,
    );
    mockedUseLive.mockReturnValue({
      liveRecords: [],
      clearLiveRecords: jest.fn(),
    } as unknown as ReturnType<typeof useEventLogsLiveStream>);
  });

  it('shows the instance checkbox only when the server authorizes the selection', async () => {
    const user = userEvent.setup();
    mount();
    expect(
      screen.getByRole('checkbox', { name: 'Instance level' }),
    ).not.toBeChecked();
    await user.click(screen.getByRole('checkbox', { name: 'Instance level' }));
    expect(mockedUseEventLogs.mock.lastCall?.[0].instanceLevel).toBe(true);
    expect(mockedUseLive.mock.lastCall?.[0].enabled).toBe(false);
    await user.click(screen.getByRole('button', { name: 'Change app' }));
    expect(
      screen.queryByRole('checkbox', { name: 'Instance level' }),
    ).not.toBeInTheDocument();
    expect(mockedUseEventLogs.mock.lastCall?.[0].instanceLevel).toBe(false);
  });

  it('pauses and resumes instance polling without subscribing to local-only logs', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole('checkbox', { name: 'Instance level' }));
    expect(mockedUseEventLogs.mock.lastCall?.[1]?.pollInterval).toBe(15000);
    await user.click(screen.getByRole('button', { name: 'Pause' }));
    expect(mockedUseEventLogs.mock.lastCall?.[1]?.pollInterval).toBe(0);
    await user.click(screen.getByRole('button', { name: 'Resume' }));
    await waitFor(() =>
      expect(mockedUseEventLogs.mock.lastCall?.[1]?.pollInterval).toBe(15000),
    );
    expect(mockedUseLive.mock.lastCall?.[0].enabled).toBe(false);
  });

  it('uses a selected bucket for table queries and excludes the next bucket boundary', async () => {
    const user = userEvent.setup();
    mount();
    await user.click(screen.getByRole('button', { name: 'Select bucket' }));
    expect(mockedUseEventLogs.mock.lastCall?.[0].filters?.dateRange).toEqual({
      start: '2026-10-16T00:00:00.000Z',
      end: '2026-10-16T00:01:14.999Z',
    });
    expect(mockedUseLive.mock.lastCall?.[0].enabled).toBe(false);
  });
});
