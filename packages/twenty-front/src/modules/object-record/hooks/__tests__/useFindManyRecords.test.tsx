import { renderHook } from '@testing-library/react';
import { useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import {
  query,
  responseData,
  variables,
} from '@/object-record/hooks/__mocks__/useFindManyRecords';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

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

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});
describe('useFindManyRecords', () => {
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

        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(generatedMockObjectMetadataItems);

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
