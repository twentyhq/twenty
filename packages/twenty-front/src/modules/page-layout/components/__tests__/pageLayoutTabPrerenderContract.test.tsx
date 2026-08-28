import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import {
  ApolloProvider,
  useQuery,
  useSuspenseQuery,
} from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import { Activity, Suspense, useEffect } from 'react';
import { of } from 'rxjs';

// Tab prerendering has two mechanisms, chosen per tab content
// (getPageLayoutTabPrerenderMode). Suspense-backed data tabs mount inside
// <Activity mode="hidden">: queries fire during render while effects stay
// unmounted. Application widget tabs mount CSS-hidden with effects live so
// their sandbox fully boots. This test guards the platform behaviors both
// mechanisms are built on: what fetches while hidden under each, that
// revealing neither refetches nor flashes a fallback, and that classic
// useQuery preloads nothing under a hidden Activity, which is why the data
// cards must not regress to it.
const PRERENDER_PROBE_QUERY = gql`
  query PrerenderProbe {
    probe
  }
`;

const createOperationTrackingClient = () => {
  const operationCounts: Record<string, number> = {};

  const link = new ApolloLink((operation) => {
    const operationName = operation.operationName ?? 'anonymous';
    operationCounts[operationName] = (operationCounts[operationName] ?? 0) + 1;

    return of({ data: { probe: 'probe-loaded' } });
  });

  return {
    client: new ApolloClient({ link, cache: new InMemoryCache() }),
    operationCounts,
  };
};

const ProbeWidget = () => {
  const { data, loading } = useQuery<{ probe: string }>(PRERENDER_PROBE_QUERY);

  if (loading && !data) {
    return <div>probe-skeleton</div>;
  }

  return <div>{data?.probe}</div>;
};

const flushMicrotasks = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 50);
  });

const SuspenseProbeWidget = ({
  onEffectsMounted,
}: {
  onEffectsMounted: () => void;
}) => {
  const { data } = useSuspenseQuery<{ probe: string }>(PRERENDER_PROBE_QUERY);

  useEffect(() => {
    onEffectsMounted();
  }, [onEffectsMounted]);

  return <div>{data?.probe}</div>;
};

const SuspenseProbeTab = ({
  client,
  isActiveTab,
  onEffectsMounted,
}: {
  client: ApolloClient;
  isActiveTab: boolean;
  onEffectsMounted: () => void;
}) => (
  <ApolloProvider client={client}>
    <Activity mode={isActiveTab ? 'visible' : 'hidden'}>
      <Suspense fallback={<div>probe-skeleton</div>}>
        <SuspenseProbeWidget onEffectsMounted={onEffectsMounted} />
      </Suspense>
    </Activity>
  </ApolloProvider>
);

describe('page layout tab prerender contract with Activity and useSuspenseQuery', () => {
  it('starts the query while hidden without mounting effects', async () => {
    const { client, operationCounts } = createOperationTrackingClient();
    const onEffectsMounted = jest.fn();

    render(
      <SuspenseProbeTab
        client={client}
        isActiveTab={false}
        onEffectsMounted={onEffectsMounted}
      />,
    );

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });

    expect(onEffectsMounted).not.toHaveBeenCalled();
  });

  it('reveals prerendered content without refetch, then mounts effects', async () => {
    const { client, operationCounts } = createOperationTrackingClient();
    const onEffectsMounted = jest.fn();

    const { rerender } = render(
      <SuspenseProbeTab
        client={client}
        isActiveTab={false}
        onEffectsMounted={onEffectsMounted}
      />,
    );

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });

    rerender(
      <SuspenseProbeTab
        client={client}
        isActiveTab={true}
        onEffectsMounted={onEffectsMounted}
      />,
    );

    expect(screen.getByText('probe-loaded')).toBeVisible();
    expect(screen.queryByText('probe-skeleton')).not.toBeInTheDocument();
    expect(operationCounts.PrerenderProbe).toBe(1);
    expect(onEffectsMounted).toHaveBeenCalledTimes(1);
  });
});

const OffscreenProbeTab = ({
  client,
  isActiveTab,
}: {
  client: ApolloClient;
  isActiveTab: boolean;
}) => (
  <ApolloProvider client={client}>
    <div style={{ display: isActiveTab ? 'contents' : 'none' }}>
      <ProbeWidget />
    </div>
  </ApolloProvider>
);

describe('page layout tab prerender contract with offscreen-mounted classic useQuery', () => {
  it('starts the query while the tab content is hidden', async () => {
    const { client, operationCounts } = createOperationTrackingClient();

    render(<OffscreenProbeTab client={client} isActiveTab={false} />);

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });
  });

  it('reveals offscreen content without a second fetch or loading state', async () => {
    const { client, operationCounts } = createOperationTrackingClient();

    const { rerender } = render(
      <OffscreenProbeTab client={client} isActiveTab={false} />,
    );

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });

    rerender(<OffscreenProbeTab client={client} isActiveTab={true} />);

    expect(screen.getByText('probe-loaded')).toBeVisible();
    expect(screen.queryByText('probe-skeleton')).not.toBeInTheDocument();
    expect(operationCounts.PrerenderProbe).toBe(1);
  });
});

describe('page layout tab prerender contract with classic useQuery inside Activity', () => {
  it('does not start the query while hidden, so widgets must not regress to it', async () => {
    const { client, operationCounts } = createOperationTrackingClient();

    render(
      <ApolloProvider client={client}>
        <Activity mode="hidden">
          <ProbeWidget />
        </Activity>
      </ApolloProvider>,
    );

    await flushMicrotasks();

    expect(operationCounts.PrerenderProbe).toBeUndefined();
  });
});
