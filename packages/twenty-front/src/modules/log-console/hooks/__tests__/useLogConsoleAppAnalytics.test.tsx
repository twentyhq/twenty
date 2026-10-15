import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useLogConsoleAppAnalytics } from '@/log-console/hooks/useLogConsoleAppAnalytics';
import {
  FindApplicationAnalyticsDocument,
  FindApplicationRegistrationAnalyticsDocument,
} from '~/generated-metadata/graphql';

const PERIOD_START = '2026-10-01T00:00:00.000Z';
const PERIOD_END = '2026-10-16T00:00:00.000Z';
const POLL_INTERVAL_MS = 30_000;

const buildAnalytics = (functionExecutions: number) => ({
  __typename: 'ApplicationRegistrationAnalytics' as const,
  periodStart: PERIOD_START,
  periodEnd: PERIOD_END,
  totals: {
    __typename: 'ApplicationRegistrationAnalyticsTotals' as const,
    installSucceeded: 0,
    installFailed: 0,
    upgradeSucceeded: 0,
    upgradeFailed: 0,
    uninstallSucceeded: 0,
    uninstallFailed: 0,
    functionExecutions,
    functionErrors: 0,
    apiRateLimited: 0,
    jobRateLimited: 0,
    creditsCharged: 0,
    activeWorkspaces: 1,
  },
  timeSeries: [],
  functionErrorsByType: [],
  functionErrorsByFunction: [],
  functionExecutionsByFunction: [],
  lifecycleFailuresByErrorCode: [],
  creditsChargedByOperation: [],
  versions: [],
});

const TARGETS = [
  {
    description: 'an app installed in this workspace',
    target: { scope: 'current-workspace' as const, applicationId: 'app-1' },
    query: FindApplicationAnalyticsDocument,
    variables: {
      input: {
        applicationId: 'app-1',
        periodStart: PERIOD_START,
        periodEnd: PERIOD_END,
      },
    },
    data: { findApplicationAnalytics: null },
  },
  {
    description: 'an app across workspaces',
    target: {
      scope: 'all-workspaces' as const,
      applicationRegistrationId: 'registration-1',
    },
    query: FindApplicationRegistrationAnalyticsDocument,
    variables: {
      input: {
        id: 'registration-1',
        periodStart: PERIOD_START,
        periodEnd: PERIOD_END,
      },
    },
    data: { findApplicationRegistrationAnalytics: null },
  },
];

describe('useLogConsoleAppAnalytics', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('refreshes cached analytics immediately when the report remounts', async () => {
    const variables = {
      input: {
        applicationId: 'app-1',
        periodStart: PERIOD_START,
        periodEnd: PERIOD_END,
      },
    };
    const cache = new InMemoryCache();
    cache.writeQuery({
      query: FindApplicationAnalyticsDocument,
      variables,
      data: { findApplicationAnalytics: buildAnalytics(1) },
    });

    let functionExecutions = 1;
    const networkRequest = jest.fn();
    const client = new ApolloClient({
      cache,
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            networkRequest();
            functionExecutions += 1;
            observer.next({
              data: {
                findApplicationAnalytics: buildAnalytics(functionExecutions),
              },
            });
            observer.complete();
          }),
      ),
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <ApolloProvider client={client}>{children}</ApolloProvider>
    );
    const renderAnalytics = () =>
      renderHook(
        () =>
          useLogConsoleAppAnalytics({
            target: { scope: 'current-workspace', applicationId: 'app-1' },
            periodStart: PERIOD_START,
            periodEnd: PERIOD_END,
            isPaused: false,
            isLive: true,
          }),
        { wrapper },
      );

    const firstMount = renderAnalytics();
    await waitFor(() => expect(networkRequest).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        firstMount.result.current.analytics?.totals.functionExecutions,
      ).toBe(2),
    );
    firstMount.unmount();

    const secondMount = renderAnalytics();
    await waitFor(() => expect(networkRequest).toHaveBeenCalledTimes(2));
    expect(
      secondMount.result.current.analytics?.totals.functionExecutions,
    ).toBe(3);
    secondMount.unmount();
  });

  it.each(['success', 'error'] as const)(
    'keeps the displayed analytics when an in-flight poll returns %s after pause',
    async (outcome) => {
      jest.useFakeTimers();
      const pendingResponses: Array<{
        resolve: (functionExecutions: number) => void;
        reject: (error: Error) => void;
        isClosed: () => boolean;
      }> = [];
      const client = new ApolloClient({
        cache: new InMemoryCache(),
        link: new ApolloLink(
          () =>
            new Observable((observer) => {
              pendingResponses.push({
                resolve: (functionExecutions) => {
                  observer.next({
                    data: {
                      findApplicationAnalytics:
                        buildAnalytics(functionExecutions),
                    },
                  });
                  observer.complete();
                },
                reject: (error) => observer.error(error),
                isClosed: () => observer.closed,
              });
            }),
        ),
      });
      const wrapper = ({ children }: { children: ReactNode }) => (
        <ApolloProvider client={client}>{children}</ApolloProvider>
      );

      const { result, rerender, unmount } = renderHook(
        ({ isPaused }) =>
          useLogConsoleAppAnalytics({
            target: { scope: 'current-workspace', applicationId: 'app-1' },
            periodStart: PERIOD_START,
            periodEnd: PERIOD_END,
            isPaused,
            isLive: true,
          }),
        { initialProps: { isPaused: false }, wrapper },
      );

      await act(async () => {
        await jest.advanceTimersByTimeAsync(100);
      });
      expect(pendingResponses).toHaveLength(1);

      await act(async () => {
        pendingResponses[0].resolve(1);
      });
      expect(result.current.analytics?.totals.functionExecutions).toBe(1);

      await act(async () => {
        await jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
      });
      expect(pendingResponses).toHaveLength(2);

      rerender({ isPaused: true });
      expect(pendingResponses[1].isClosed()).toBe(false);
      await act(async () => {
        if (outcome === 'error') {
          pendingResponses[1].reject(new Error('Poll failed'));
        } else {
          pendingResponses[1].resolve(2);
        }
      });

      expect(result.current.analytics?.totals.functionExecutions).toBe(1);
      expect(result.current.error).toBeUndefined();
      unmount();
    },
  );

  it.each(TARGETS)(
    'polls $description only while live and refreshes immediately on resume',
    async ({ target, query, variables, data }) => {
      jest.useFakeTimers();
      const requestCount = jest.fn();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <MockedProvider
          mocks={[
            {
              request: { query, variables },
              result: () => {
                requestCount();
                return { data };
              },
              maxUsageCount: Number.POSITIVE_INFINITY,
            },
          ]}
        >
          {children}
        </MockedProvider>
      );

      const { rerender, unmount } = renderHook(
        ({ isPaused, isLive }) =>
          useLogConsoleAppAnalytics({
            target,
            periodStart: PERIOD_START,
            periodEnd: PERIOD_END,
            isPaused,
            isLive,
          }),
        { initialProps: { isPaused: false, isLive: true }, wrapper },
      );

      await act(async () => {
        await jest.advanceTimersByTimeAsync(100);
      });
      expect(requestCount).toHaveBeenCalledTimes(1);

      await act(async () => {
        await jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS);
      });
      expect(requestCount).toHaveBeenCalledTimes(2);

      rerender({ isPaused: true, isLive: true });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
      });
      expect(requestCount).toHaveBeenCalledTimes(2);

      rerender({ isPaused: false, isLive: true });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(100);
      });
      expect(requestCount).toHaveBeenCalledTimes(3);

      rerender({ isPaused: false, isLive: false });
      await act(async () => {
        await jest.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2);
      });
      expect(requestCount).toHaveBeenCalledTimes(3);

      unmount();
    },
  );
});
