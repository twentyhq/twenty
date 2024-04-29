import { ReactNode, useEffect, useState } from 'react';
import { expect } from '@storybook/test';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <ObjectMetadataItemSetter>{children}</ObjectMetadataItemSetter>
  </RecoilRoot>
);

const ObjectMetadataItemSetter = ({ children }: { children: ReactNode }) => {
  const setObjectMetadataItems = useSetRecoilState(objectMetadataItemsState);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setObjectMetadataItems(getObjectMetadataItemsMock());
    setIsLoaded(true);
  }, [setObjectMetadataItems]);

  return isLoaded ? <>{children}</> : null;
};

describe('useGenerateFindManyRecordsForMultipleMetadataItemsQuery', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => {
        return useGenerateCombinedFindManyRecordsQuery({
          operationSignatures: getObjectMetadataItemsMock()
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
