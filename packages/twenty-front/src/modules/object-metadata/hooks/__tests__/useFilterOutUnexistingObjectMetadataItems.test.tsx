import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

import { useFilterOutUnexistingObjectMetadataItems } from '../useFilterOutUnexistingObjectMetadataItems';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useFilterOutUnexistingObjectMetadataItems', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        setMetadataItems(mockObjectMetadataItems.slice(1));
        return useFilterOutUnexistingObjectMetadataItems();
      },
      {
        wrapper: RecoilRoot,
      },
    );

    const objectExists = result.current.filterOutUnexistingObjectMetadataItems(
      mockObjectMetadataItems[0],
    );

    expect(objectExists).toBe(false);

    const secondObjectExists =
      result.current.filterOutUnexistingObjectMetadataItems(
        mockObjectMetadataItems[1],
      );

    expect(secondObjectExists).toBe(true);
  });
});
