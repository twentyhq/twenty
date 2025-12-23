import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';

import { SnackBarComponentInstanceContext } from '@/ui/feedback/snack-bar-manager/contexts/SnackBarComponentInstanceContext';
import {
  query,
  responseData,
} from '@/object-metadata/hooks/__mocks__/useFindManyObjectMetadataItems';

const mocks = [
  {
    request: {
      query,
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
      <SnackBarComponentInstanceContext.Provider
        value={{ instanceId: 'snack-bar-manager' }}
      >
        {children}
      </SnackBarComponentInstanceContext.Provider>
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
