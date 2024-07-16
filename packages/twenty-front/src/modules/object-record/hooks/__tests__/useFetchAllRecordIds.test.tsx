import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode, useEffect } from 'react';
import { RecoilRoot, useRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import {
  mockPageSize,
  peopleMockWithIdsOnly,
  query,
  responseFirstRequest,
  responseSecondRequest,
  responseThirdRequest,
  variablesFirstRequest,
  variablesSecondRequest,
  variablesThirdRequest,
} from '@/object-record/hooks/__mocks__/useFetchAllRecordIds';
import { useFetchAllRecordIds } from '@/object-record/hooks/useFetchAllRecordIds';
import { SnackBarManagerScopeInternalContext } from '@/ui/feedback/snack-bar-manager/scopes/scope-internal-context/SnackBarManagerScopeInternalContext';

const mocks = [
  {
    delay: 100,
    request: {
      query,
      variables: variablesFirstRequest,
    },
    result: jest.fn(() => ({
      data: responseFirstRequest,
    })),
  },
  {
    delay: 100,
    request: {
      query,
      variables: variablesSecondRequest,
    },
    result: jest.fn(() => ({
      data: responseSecondRequest,
    })),
  },
  {
    delay: 100,
    request: {
      query,
      variables: variablesThirdRequest,
    },
    result: jest.fn(() => ({
      data: responseThirdRequest,
    })),
  },
];

describe('useFetchAllRecordIds', () => {
  it('fetches all record ids with fetch more synchronous loop', async () => {
    const Wrapper = ({ children }: { children: ReactNode }) => (
      <RecoilRoot>
        <SnackBarManagerScopeInternalContext.Provider
          value={{
            scopeId: 'snack-bar-manager',
          }}
        >
          <MockedProvider mocks={mocks} addTypename={false}>
            {children}
          </MockedProvider>
        </SnackBarManagerScopeInternalContext.Provider>
      </RecoilRoot>
    );

    const { result } = renderHook(
      () => {
        const [, setObjectMetadataItems] = useRecoilState(
          objectMetadataItemsState,
        );

        useEffect(() => {
          setObjectMetadataItems(getObjectMetadataItemsMock());
        }, [setObjectMetadataItems]);

        return useFetchAllRecordIds({
          objectNameSingular: 'person',
          pageSize: mockPageSize,
        });
      },
      {
        wrapper: Wrapper,
      },
    );

    const { fetchAllRecordIds } = result.current;

    let recordIds: string[] = [];

    await act(async () => {
      recordIds = await fetchAllRecordIds();
    });

    expect(mocks[0].result).toHaveBeenCalled();
    expect(mocks[1].result).toHaveBeenCalled();
    expect(mocks[2].result).toHaveBeenCalled();

    expect(recordIds).toEqual(
      peopleMockWithIdsOnly.edges.map((edge) => edge.node.id).slice(0, 6),
    );
  });
});
