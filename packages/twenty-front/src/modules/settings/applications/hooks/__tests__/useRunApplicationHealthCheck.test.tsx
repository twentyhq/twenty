import { ApolloLink } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { type ReactNode } from 'react';
import { Subject } from 'rxjs';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { MY_APPLICATION_HEALTH_CHECK_RUNNER } from '@/settings/app-preferences/constants/MyApplicationHealthCheckRunner';
import { myApplicationHealthCheckFamilyState } from '@/settings/app-preferences/states/myApplicationHealthCheckFamilyState';
import { useRunApplicationHealthCheck } from '@/settings/applications/hooks/useRunApplicationHealthCheck';
import {
  ApplicationHealthStatus,
  type RunMyApplicationHealthCheckMutation,
} from '~/generated-metadata/graphql';

const APPLICATION_ID = 'health-check-application';

const buildResponse = (title: string) => ({
  data: {
    runMyApplicationHealthCheck: {
      __typename: 'ApplicationHealthCheckResult',
      status: ApplicationHealthStatus.WARNING,
      title,
      description: null,
      action: null,
    },
  } satisfies RunMyApplicationHealthCheckMutation,
});

describe('useRunApplicationHealthCheck', () => {
  it.each(['success', 'failure', 'absence'])(
    'keeps the newer result when an older request finishes with %s',
    async (olderOutcome) => {
      const firstResponse = new Subject<{
        data: RunMyApplicationHealthCheckMutation;
      }>();
      const secondResponse = new Subject<{
        data: RunMyApplicationHealthCheckMutation;
      }>();
      let requestCount = 0;
      const link = new ApolloLink(() =>
        requestCount++ === 0 ? firstResponse : secondResponse,
      );
      const store = createStore();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <Provider store={store}>
          <MockedProvider link={link}>
            <ToastProvider>{children}</ToastProvider>
          </MockedProvider>
        </Provider>
      );
      const { result } = renderHook(
        () =>
          useRunApplicationHealthCheck({
            applicationId: APPLICATION_ID,
            runner: MY_APPLICATION_HEALTH_CHECK_RUNNER,
          }),
        { wrapper },
      );
      let firstRun = Promise.resolve();
      let secondRun = Promise.resolve();

      act(() => {
        firstRun = result.current.runApplicationHealthCheck({
          shouldKeepPreviousResult: false,
        });
        secondRun = result.current.runApplicationHealthCheck({
          shouldKeepPreviousResult: true,
        });
      });

      await act(async () => {
        secondResponse.next(buildResponse('Newer result'));
        secondResponse.complete();
        await secondRun;
      });
      const healthCheckAtom =
        myApplicationHealthCheckFamilyState.atomFamily(APPLICATION_ID);

      expect(store.get(healthCheckAtom).result?.title).toBe('Newer result');

      await act(async () => {
        if (olderOutcome === 'failure') {
          firstResponse.error(new Error('Older request failed'));
        } else {
          firstResponse.next(
            olderOutcome === 'absence'
              ? { data: { runMyApplicationHealthCheck: null } }
              : buildResponse('Older result'),
          );
          firstResponse.complete();
        }

        await firstRun;
      });

      expect(store.get(healthCheckAtom).result?.title).toBe('Newer result');
    },
  );
});
