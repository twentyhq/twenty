import { renderHook, waitFor } from '@testing-library/react';
import { type MockedResponse } from '@apollo/client/testing';
import { useApplicationManifest } from '~/pages/settings/layout/hooks/useApplicationManifest';
import {
  FindMarketplaceAppDetailDocument,
  FindOneApplicationDocument,
} from '~/generated-metadata/graphql';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const APP_ID = 'app-1';
const APP_UID = 'uid-1';

const findOneApplicationMock = (
  application: { id: string; universalIdentifier: string; name: string } | null,
): MockedResponse => ({
  request: {
    query: FindOneApplicationDocument,
    variables: { id: APP_ID },
  },
  result: { data: { findOneApplication: application } },
});

const findMarketplaceAppDetailMock = (
  manifest: object | null,
): MockedResponse => ({
  request: {
    query: FindMarketplaceAppDetailDocument,
    variables: { universalIdentifier: APP_UID },
  },
  result: {
    data: {
      findMarketplaceAppDetail: manifest === null ? null : { manifest },
    },
  },
});

describe('useApplicationManifest', () => {
  it('skips both queries when applicationId is empty', () => {
    const wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });
    const { result } = renderHook(() => useApplicationManifest(''), {
      wrapper,
    });
    expect(result.current.application).toBeUndefined();
    expect(result.current.manifest).toBeUndefined();
  });

  it('exposes an undefined manifest when findMarketplaceAppDetail returns null', async () => {
    const wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: [
        findOneApplicationMock({
          id: APP_ID,
          universalIdentifier: APP_UID,
          name: 'My App',
        }),
        findMarketplaceAppDetailMock(null),
      ],
    });

    const { result } = renderHook(() => useApplicationManifest(APP_ID), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.manifest).toBeUndefined();
  });
});
