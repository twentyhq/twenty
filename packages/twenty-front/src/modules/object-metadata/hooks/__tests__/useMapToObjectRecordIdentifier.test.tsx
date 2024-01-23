import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useMapToObjectRecordIdentifier', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const objectMetadataItem = mockObjectMetadataItems.find(
          (item) => item.nameSingular === 'person',
        )!;

        return useMapToObjectRecordIdentifier({
          objectMetadataItem,
        })({ id: 'id', name: { firstName: 'Sheldon', lastName: 'Cooper' } });
      },
      {
        wrapper: RecoilRoot,
      },
    );

    expect(result.current).toEqual({
      id: 'id',
      name: 'Sheldon Cooper',
      avatarUrl: '',
      avatarType: 'rounded',
      linkToShowPage: '/object/person/id',
    });
  });
});
