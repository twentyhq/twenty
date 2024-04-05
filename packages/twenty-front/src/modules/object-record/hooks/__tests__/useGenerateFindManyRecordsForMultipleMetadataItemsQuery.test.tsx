import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { useGenerateFindManyRecordsForMultipleMetadataItemsQuery } from '@/object-record/multiple-objects/hooks/useGenerateFindManyRecordsForMultipleMetadataItemsQuery';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useGenerateFindManyRecordsForMultipleMetadataItemsQuery', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        const mockObjectMetadataItems = getObjectMetadataItemsMock();

        return useGenerateFindManyRecordsForMultipleMetadataItemsQuery({
          targetObjectMetadataItems: mockObjectMetadataItems.slice(0, 2),
        });
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current?.kind).toBe('Document');
    expect(result.current?.definitions.length).toBe(1);
  });
});
