import { ApolloClient, ApolloLink, gql, InMemoryCache } from '@apollo/client';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { render, screen, waitFor } from '@testing-library/react';
import { of } from 'rxjs';

// Tab prerendering mounts hovered tab content inside a display: none wrapper
// (not <Activity mode="hidden">: Apollo starts useQuery fetches from effects,
// which hidden activities do not mount, so nothing would preload). This test
// guards the two platform behaviors the feature relies on: queries fire while
// the tree is hidden, and revealing the tree does not remount it, so no
// second fetch and no loading state occur.
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

const ProbeTab = ({
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

describe('page layout tab prerender contract', () => {
  it('starts the query while the tab content is hidden', async () => {
    const { client, operationCounts } = createOperationTrackingClient();

    render(<ProbeTab client={client} isActiveTab={false} />);

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });
  });

  it('reveals prerendered content without a second fetch or loading state', async () => {
    const { client, operationCounts } = createOperationTrackingClient();

    const { rerender } = render(
      <ProbeTab client={client} isActiveTab={false} />,
    );

    await waitFor(() => {
      expect(operationCounts.PrerenderProbe).toBe(1);
    });

    rerender(<ProbeTab client={client} isActiveTab={true} />);

    expect(screen.getByText('probe-loaded')).toBeVisible();
    expect(screen.queryByText('probe-skeleton')).not.toBeInTheDocument();
    expect(operationCounts.PrerenderProbe).toBe(1);
  });
});
