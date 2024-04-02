import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useFindManyRecords';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        deletePeople: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    </SnackBarProviderScope>
  </RecoilRoot>
);

describe('useFindManyRecords', () => {
  it('should skip fetch if currentWorkspaceMember is undefined', async () => {
    const { result } = renderHook(
      () => useFindManyRecords({ objectNameSingular: 'person' }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  it('should work as expected', async () => {
    const onCompleted = jest.fn();

    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        setCurrentWorkspaceMember({
          id: '32219445-f587-4c40-b2b1-6d3205ed96da',
          name: { firstName: 'John', lastName: 'Connor' },
          locale: 'en',
        });

        const mockObjectMetadataItems = getObjectMetadataItemsMock();

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(mockObjectMetadataItems);

        return useFindManyRecords({
          objectNameSingular: 'person',
          onCompleted,
        });
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(result.current.records.length).toBe(0);
  });
});
