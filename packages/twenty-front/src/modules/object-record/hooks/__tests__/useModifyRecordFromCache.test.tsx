import { ReactNode } from 'react';
import { useApolloClient } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <MockedProvider addTypename={false}>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

const recordId = '91408718-a29f-4678-b573-c791e8664c2a';

describe('useModifyRecordFromCache', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const apolloClient = useApolloClient();
        const mockObjectMetadataItems = getObjectMetadataItemsMock();

        const personMetadataItem = mockObjectMetadataItems.find(
          (item) => item.nameSingular === 'person',
        )!;

        return {
          modifyRecordFromCache: useModifyRecordFromCache({
            objectMetadataItem: personMetadataItem,
          }),
          cache: apolloClient.cache,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    const spy = jest.spyOn(result.current.cache, 'modify');

    act(() => {
      result.current.modifyRecordFromCache(recordId, {});
    });

    expect(spy).toHaveBeenCalledWith({
      id: `Person:${recordId}`,
      fields: {},
    });
  });
});
