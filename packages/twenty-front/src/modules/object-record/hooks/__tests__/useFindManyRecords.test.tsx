import { renderHook } from '@testing-library/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
  onInitializeRecoilSnapshot: () => {
    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
  },
});

describe('useFindManyRecords', () => {
  it('should work as expected', async () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: '32219445-f587-4c40-b2b1-6d3205ed96da',
      name: { firstName: 'John', lastName: 'Connor' },
      locale: 'en',
      colorScheme: 'Light',
      userEmail: 'userEmail',
    });

    const onCompleted = jest.fn();

    const { result } = renderHook(
      () => {
        return useFindManyRecords({
          objectNameSingular: 'person',
          onCompleted,
          skip: true,
        });
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.records.length).toBe(0);
    expect(result.current.objectMetadataItem).toBeDefined();
  });
});
