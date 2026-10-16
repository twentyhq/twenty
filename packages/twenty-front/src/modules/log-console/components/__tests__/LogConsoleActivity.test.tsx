import { MockedProvider } from '@apollo/client/testing/react';
import { setupI18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LogConsoleActivity } from '@/log-console/components/LogConsoleActivity';
import { GET_APPLICATION_LOG_ACTIVITY } from '@/settings/event-logs/graphql/queries/getApplicationLogActivity';
import { EventLogTable } from '~/generated-metadata/graphql';

jest.mock('@/log-console/hooks/useLogConsoleTimeZone', () => ({
  useLogConsoleTimeZone: () => 'UTC',
}));
jest.mock('@nivo/line', () => ({
  ResponsiveLine: ({
    onClick,
  }: {
    onClick: (point: { data: { x: number } }) => void;
  }) => (
    <button onClick={() => onClick({ data: { x: 0 } })}>Activity bucket</button>
  ),
}));

const i18n = setupI18n({ locale: 'en', messages: { en: {} } });
const input = {
  table: EventLogTable.APPLICATION_LOG,
  instanceLevel: true,
  filters: {
    dateRange: {
      start: '2026-10-16T00:00:00.000Z',
      end: '2026-10-16T01:00:00.000Z',
    },
  },
};
const bucket = {
  start: '2026-10-16T00:00:00.000Z',
  end: '2026-10-16T00:01:15.000Z',
  info: 1000,
  warning: 2,
  error: 3,
};

const renderActivity = (error?: Error) => {
  const onSelectionChange = jest.fn();
  render(
    <I18nProvider i18n={i18n}>
      <MockedProvider
        mocks={[
          {
            request: {
              query: GET_APPLICATION_LOG_ACTIVITY,
              variables: {
                input: { ...input, first: 1, includeActivity: true },
              },
            },
            ...(error
              ? { error }
              : { result: { data: { eventLogs: { activity: [bucket] } } } }),
          },
        ]}
      >
        <LogConsoleActivity
          input={input}
          isPaused={false}
          isLive={false}
          selection={{ start: bucket.start, end: bucket.end }}
          onSelectionChange={onSelectionChange}
        />
      </MockedProvider>
    </I18nProvider>,
  );
  return { onSelectionChange };
};

describe('LogConsoleActivity', () => {
  it('collapses and expands the chart with the Activity chevron', async () => {
    const user = userEvent.setup();
    renderActivity();
    await screen.findByRole('button', { name: 'Activity bucket' });
    const trigger = screen.getByRole('button', { name: 'Activity' });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await user.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('selects a bucket and clears the selection without adding a second time picker', async () => {
    const user = userEvent.setup();
    const { onSelectionChange } = renderActivity();
    await user.click(
      await screen.findByRole('button', { name: 'Activity bucket' }),
    );
    expect(onSelectionChange).toHaveBeenLastCalledWith({
      start: bucket.start,
      end: bucket.end,
    });
    await user.click(
      screen.getByRole('button', { name: 'Clear time selection' }),
    );
    expect(onSelectionChange).toHaveBeenLastCalledWith(undefined);
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  });

  it('shows an unavailable state instead of a healthy zero graph on failure', async () => {
    renderActivity(new Error('unavailable'));
    await waitFor(() =>
      expect(screen.getByText('Could not load activity')).toBeInTheDocument(),
    );
    expect(
      screen.queryByRole('button', { name: 'Activity bucket' }),
    ).not.toBeInTheDocument();
  });
});
