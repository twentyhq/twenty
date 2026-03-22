import { MockedProvider } from '@apollo/client/testing/react';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { Provider as JotaiProvider } from 'jotai';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { generateTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/generateTestEnrichedObjectMetadataItemsMock';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <MockedProvider>{children}</MockedProvider>
  </JotaiProvider>
);

describe('useGetRelationMetadata', () => {
  beforeEach(() => {
    setTestObjectMetadataItemsInMetadataStore(
      jotaiStore,
      generateTestEnrichedObjectMetadataItemsMock,
    );
  });

  it('should return correct properties', async () => {
    const objectMetadata = generateTestEnrichedObjectMetadataItemsMock.find(
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
      generateTestEnrichedObjectMetadataItemsMock.find(
        (item) => item.nameSingular === 'opportunity',
      );
    const expectedRelationFieldMetadataItem =
      expectedRelationObjectMetadataItem?.fields.find(
        (field) => field.name === 'pointOfContact',
      );

    expect(relationObjectMetadataItem).toMatchObject(
      expectedRelationObjectMetadataItem!,
    );
    expect(relationFieldMetadataItem).toMatchObject(
      expectedRelationFieldMetadataItem!,
    );
    expect(relationType).toBe('ONE_TO_MANY');
  });
});
