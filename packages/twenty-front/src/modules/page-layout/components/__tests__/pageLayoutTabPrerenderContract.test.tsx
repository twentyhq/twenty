import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import { Activity } from 'react';
import { of } from 'rxjs';

// Prerendered tabs mount CSS-hidden (display: none) rather than inside a
// hidden <Activity>. This test guards the platform behaviors that choice is
// built on: Apollo's useQuery starts fetching from effects, so it fetches
// under display: none but not under a hidden Activity, and revealing an
// offscreen-mounted tab neither refetches nor flashes a loading state.
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
  it('does not start the query while hidden, so tabs must not regress to it', async () => {
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
