import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useRelationMetadata } from '@/object-metadata/hooks/useRelationMetadata';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

import { TestApolloMetadataClientProvider } from '../__mocks__/ApolloMetadataClientProvider';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>
      <TestApolloMetadataClientProvider>
        {children}
      </TestApolloMetadataClientProvider>
    </MockedProvider>
  </RecoilRoot>
);

describe('useRelationMetadata', () => {
  it('should return correct properties', async () => {
    const { result, rerender } = renderHook(
      ({ fieldMetadataItem }: { fieldMetadataItem?: FieldMetadataItem }) =>
        useRelationMetadata({ fieldMetadataItem }),
      {
        wrapper: Wrapper,
        initialProps: {},
      },
    );

    const {
      relationFieldMetadataItem,
      relationObjectMetadataItem,
      relationType,
    } = result.current;

    expect(relationFieldMetadataItem).toBeUndefined();
    expect(relationObjectMetadataItem).toBeUndefined();
    expect(relationType).toBeUndefined();

    const objectMetadataItems = getObjectMetadataItemsMock();
    const objectMetadata = objectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;
    const fieldMetadataItem = objectMetadata.fields.find(
      (field) => field.name === 'opportunities',
    )!;

    rerender({ fieldMetadataItem });

    expect(result.current.relationType).toBe('ONE_TO_MANY');
  });
});
