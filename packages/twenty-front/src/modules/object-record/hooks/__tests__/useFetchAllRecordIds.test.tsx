import { act, renderHook } from '@testing-library/react';
import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
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
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

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

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFetchAllRecordIds', () => {
  it('fetches all record ids with fetch more synchronous loop', async () => {
    const { result } = renderHook(
      () => {
        const [, setObjectMetadataItems] = useRecoilState(
          objectMetadataItemsState,
        );

        useEffect(() => {
          setObjectMetadataItems(generatedMockObjectMetadataItems);
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
