import { renderHook } from '@testing-library/react';

import { useGetObjectOrderByField } from '@/object-metadata/hooks/useGetObjectOrderByField';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useGetObjectOrderByField', () => {
  it('should work as expected', () => {
    const objectMetadataItem = mockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;

    const { result } = renderHook(() =>
      useGetObjectOrderByField({ objectMetadataItem })('AscNullsLast'),
    );
    expect(result.current).toEqual({
      name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' },
    });
  });
});
