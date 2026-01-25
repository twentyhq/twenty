import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { TestObjectMetadataItemSetter } from '~/testing/test-helpers/TestObjectMetadataItemSetter';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <TestObjectMetadataItemSetter>{children}</TestObjectMetadataItemSetter>
  </RecoilRoot>
);

describe('useGenerateFindManyRecordsForMultipleMetadataItemsQuery', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        return useGenerateCombinedFindManyRecordsQuery({
          operationSignatures: generatedMockObjectMetadataItems
            .slice(0, 2)
            .map((item) => ({
              objectNameSingular: item.nameSingular,
              variables: {},
            })),
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
