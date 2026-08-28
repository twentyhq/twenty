import { renderHook } from '@testing-library/react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSuspenseFindManyRecords } from '@/object-record/hooks/useSuspenseFindManyRecords';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

setTestObjectMetadataItemsInMetadataStore(
  jotaiStore,
  getTestEnrichedObjectMetadataItemsMock(),
);

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

describe('useSuspenseFindManyRecords', () => {
  it('skips without suspending and returns an empty record list', () => {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: '32219445-f587-4c40-b2b1-6d3205ed96da',
      name: { firstName: 'John', lastName: 'Connor' },
      locale: 'en',
      colorScheme: 'Light',
      userEmail: 'userEmail',
    });

    const onCompleted = jest.fn();

    const { result } = renderHook(
      () =>
        useSuspenseFindManyRecords({
          objectNameSingular: 'person',
          onCompleted,
          skip: true,
        }),
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.error).toBeUndefined();
    expect(result.current.records.length).toBe(0);
    expect(result.current.isFetchingMoreRecords).toBe(false);
    expect(result.current.objectMetadataItem).toBeDefined();
  });
});
