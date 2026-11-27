import { render, waitFor } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';

import { FrontComponentApplicationPrefetchEffect } from '@/front-components/components/FrontComponentApplicationPrefetchEffect';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import {
  GenerateFrontComponentApplicationTokenPairDocument,
  GetApplicationSdkClientChecksumsDocument,
} from '~/generated-metadata/graphql';

const mockMutate = jest.fn();
const mockQuery = jest.fn();

jest.mock('@apollo/client/react', () => ({
  ...jest.requireActual('@apollo/client/react'),
  useApolloClient: () => ({
    mutate: mockMutate,
    query: mockQuery,
  }),
}));

const FRONT_COMPONENT_ID = 'front-component-id';
const APPLICATION_ID = 'application-id';

const renderEffect = ({
  frontComponents,
}: {
  frontComponents: {
    id: string;
    applicationId: string;
    usesSdkClient: boolean;
  }[];
}) => {
  const store = createStore();

  store.set(metadataStoreState.atomFamily('frontComponents'), {
    current: frontComponents,
    draft: [],
    status: 'up-to-date',
  });

  render(
    <JotaiProvider store={store}>
      <FrontComponentApplicationPrefetchEffect
        frontComponentId={FRONT_COMPONENT_ID}
      />
    </JotaiProvider>,
  );
};

describe('FrontComponentApplicationPrefetchEffect', () => {
  beforeEach(() => {
    mockMutate.mockReset().mockReturnValue(new Promise(() => undefined));
    mockQuery.mockReset().mockResolvedValue({ data: {} });
  });

  it('should request the application token pair and SDK client checksums from the metadata store', async () => {
    renderEffect({
      frontComponents: [
        {
          id: FRONT_COMPONENT_ID,
          applicationId: APPLICATION_ID,
          usesSdkClient: true,
        },
      ],
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        mutation: GenerateFrontComponentApplicationTokenPairDocument,
        variables: { applicationId: APPLICATION_ID },
      });
    });
    expect(mockQuery).toHaveBeenCalledWith({
      query: GetApplicationSdkClientChecksumsDocument,
      variables: { applicationId: APPLICATION_ID },
    });
  });

  it('should not request SDK client checksums when the component does not use the SDK client', async () => {
    renderEffect({
      frontComponents: [
        {
          id: FRONT_COMPONENT_ID,
          applicationId: APPLICATION_ID,
          usesSdkClient: false,
        },
      ],
    });

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledTimes(1);
    });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should request nothing when the front component is not in the metadata store', () => {
    renderEffect({ frontComponents: [] });

    expect(mockMutate).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });
});
