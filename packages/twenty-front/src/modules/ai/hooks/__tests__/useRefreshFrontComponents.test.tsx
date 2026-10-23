import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client';
import { ApolloProvider, useQuery } from '@apollo/client/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { type ReactNode } from 'react';

import { useRefreshFrontComponents } from '@/ai/hooks/useRefreshFrontComponents';
import { FIND_MANY_FRONT_COMPONENTS } from '@/front-components/graphql/queries/findManyFrontComponents';

const loadStaleMetadataEntities = jest.fn();
const enqueueToast = jest.fn();
jest.mock('@/metadata-store/hooks/useLoadStaleMetadataEntities', () => ({
  useLoadStaleMetadataEntities: () => ({ loadStaleMetadataEntities }),
}));
jest.mock('twenty-ui/components/feedback', () => ({
  useToast: () => ({ enqueueToast }),
}));

const component = {
  __typename: 'FrontComponent',
  id: 'component',
  name: 'Company Search',
  applicationId: 'workspace-app',
  builtComponentChecksum: 'checksum',
  builtComponentPath: 'component.mjs',
  componentName: 'Component',
  createdAt: '',
  description: null,
  isHeadless: false,
  widgetAvailability: [
    {
      __typename: 'FrontComponentWidgetAvailability',
      pageLayoutType: 'DASHBOARD',
      objectMetadataId: null,
    },
    {
      __typename: 'FrontComponentWidgetAvailability',
      pageLayoutType: 'RECORD_PAGE',
      objectMetadataId: null,
    },
  ],
  sourceComponentPath: 'component.front-component.tsx',
  universalIdentifier: 'component',
  updatedAt: '',
  usesSdkClient: false,
  frontComponentSharedDependenciesChecksum: null,
};

describe('refresh frontend components', () => {
  beforeEach(() => jest.clearAllMocks());

  const setup = (
    components: (typeof component)[],
    cachedComponents: (typeof component)[] = [],
  ) => {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      link: new ApolloLink(
        () =>
          new Observable((observer) => {
            observer.next({ data: { frontComponents: components } });
            observer.complete();
          }),
      ),
    });
    client.writeQuery({
      query: FIND_MANY_FRONT_COMPONENTS,
      data: { frontComponents: cachedComponents },
    });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <I18nProvider i18n={i18n}>
        <ApolloProvider client={client}>{children}</ApolloProvider>
      </I18nProvider>
    );
    const { result } = renderHook(
      () => ({
        ...useRefreshFrontComponents(),
        picker: useQuery(FIND_MANY_FRONT_COMPONENTS),
      }),
      { wrapper },
    );
    return { client, result };
  };

  it('updates both an open picker and its cached list after saving', async () => {
    const { client, result } = setup([component]);
    await act(async () => result.current.refreshFrontComponents());
    await waitFor(() =>
      expect(result.current.picker.data).toEqual({
        frontComponents: [component],
      }),
    );
    expect(client.readQuery({ query: FIND_MANY_FRONT_COMPONENTS })).toEqual({
      frontComponents: [component],
    });
    expect(loadStaleMetadataEntities).toHaveBeenCalledWith(['frontComponents']);
    client.stop();
  });

  it('removes a deleted component from the open picker, cached list and metadata store', async () => {
    const { client, result } = setup([], [component]);
    await act(async () => result.current.refreshFrontComponents());
    await waitFor(() =>
      expect(result.current.picker.data).toEqual({ frontComponents: [] }),
    );
    expect(client.readQuery({ query: FIND_MANY_FRONT_COMPONENTS })).toEqual({
      frontComponents: [],
    });
    expect(loadStaleMetadataEntities).toHaveBeenCalledWith(['frontComponents']);
    client.stop();
  });
});
