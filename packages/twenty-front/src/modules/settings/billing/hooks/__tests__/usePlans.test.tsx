import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { GraphQLError } from 'graphql';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { usePlans } from '@/settings/billing/hooks/usePlans';
import { ListPlansDocument } from '~/generated-metadata/graphql';

const listPlansSuccessMock = {
  request: { query: ListPlansDocument },
  result: { data: { listPlans: [] } },
};

const listPlansSlowSuccessMock = {
  ...listPlansSuccessMock,
  delay: 50,
};

const listPlansErrorMock = {
  request: { query: ListPlansDocument },
  result: { errors: [new GraphQLError('Internal server error')] },
};

const createWrapper =
  (mocks: readonly unknown[]) =>
  ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks as never}>{children}</MockedProvider>
  );

describe('usePlans', () => {
  it('should expose the plans once the query resolves', async () => {
    const { result } = renderHook(() => usePlans(), {
      wrapper: createWrapper([listPlansSuccessMock]),
    });

    await waitFor(() => expect(result.current.isPlansLoaded).toBe(true));

    expect(result.current.error).toBeUndefined();
  });

  it('should surface the error and leave the plans unloaded when the query fails', async () => {
    const { result } = renderHook(() => usePlans(), {
      wrapper: createWrapper([listPlansErrorMock]),
    });

    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.isPlansLoaded).toBe(false);
  });

  it('should report loading and clear the error while a refetch is in flight', async () => {
    const renders: { loading: boolean; hasError: boolean }[] = [];

    const { result } = renderHook(
      () => {
        const plans = usePlans();
        renders.push({
          loading: plans.loading,
          hasError: isDefined(plans.error),
        });
        return plans;
      },
      {
        wrapper: createWrapper([listPlansErrorMock, listPlansSlowSuccessMock]),
      },
    );

    await waitFor(() => expect(result.current.error).toBeDefined());

    renders.length = 0;

    let refetching: Promise<unknown> | undefined;
    act(() => {
      refetching = result.current.refetch();
    });

    await act(async () => {
      await refetching;
    });

    expect(renders).toContainEqual({ loading: true, hasError: false });

    await waitFor(() => expect(result.current.isPlansLoaded).toBe(true));
    expect(result.current.loading).toBe(false);
  });

  it('should not run the query when skipped', () => {
    const { result } = renderHook(() => usePlans({ skip: true }), {
      wrapper: createWrapper([]),
    });

    expect(result.current.isPlansLoaded).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});
