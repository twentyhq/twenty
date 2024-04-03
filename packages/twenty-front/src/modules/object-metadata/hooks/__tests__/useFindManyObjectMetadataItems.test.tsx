import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import {
  query,
  responseData,
  variables,
} from '../__mocks__/useFindManyObjectMetadataItems';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        objects: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFindManyObjectMetadataItems', () => {
  it('should activateMetadataField', async () => {
    const { result } = renderHook(() => useFindManyObjectMetadataItems(), {
      wrapper: Wrapper,
    });

    const { loading, error, objectMetadataItems } = result.current;

    expect(loading).toBe(true);
    expect(error).toBeUndefined();
    expect(objectMetadataItems).toEqual([]);
  });
});
