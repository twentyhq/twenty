import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useGetRelationMetadata', () => {
  it('should return correct properties', async () => {
    const objectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;
    const fieldMetadataItem = objectMetadata.fields.find(
      (field) => field.name === 'pointOfContactForOpportunities',
    )!;

    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);

        useEffect(() => {
          setMetadataItems(generatedMockObjectMetadataItems);
        }, [setMetadataItems]);

        return useGetRelationMetadata();
      },
      {
        wrapper: Wrapper,
        initialProps: {},
      },
    );

    const {
      relationFieldMetadataItem,
      relationObjectMetadataItem,
      relationType,
    } = result.current({ fieldMetadataItem }) ?? {};

    const expectedRelationObjectMetadataItem =
      generatedMockObjectMetadataItems.find(
        (item) => item.nameSingular === 'opportunity',
      );
    const expectedRelationFieldMetadataItem =
      expectedRelationObjectMetadataItem?.fields.find(
        (field) => field.name === 'pointOfContact',
      );

    expect(relationObjectMetadataItem).toEqual(
      expectedRelationObjectMetadataItem,
    );
    expect(relationFieldMetadataItem).toEqual(
      expectedRelationFieldMetadataItem,
    );
    expect(relationType).toBe('ONE_TO_MANY');
  });
});
