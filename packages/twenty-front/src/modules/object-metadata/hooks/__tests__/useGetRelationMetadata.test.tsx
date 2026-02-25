import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </JotaiProvider>
);

describe('useGetRelationMetadata', () => {
  beforeEach(() => {
    jotaiStore.set(
      objectMetadataItemsState.atom,
      generatedMockObjectMetadataItems,
    );
  });

  it('should return correct properties', async () => {
    const objectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;
    const fieldMetadataItem = objectMetadata.fields.find(
      (field) => field.name === 'pointOfContactForOpportunities',
    )!;

    const { result } = renderHook(() => useGetRelationMetadata(), {
      wrapper: Wrapper,
      initialProps: {},
    });

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
