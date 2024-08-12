import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useFilteredObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        updateOneObject: responseData,
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useFilteredObjectMetadataItems', () => {
  it('should findActiveObjectMetadataItemBySlug', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFilteredObjectMetadataItems();
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      const res = result.current.findActiveObjectMetadataItemBySlug('people');
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('people');
    });
  });

  it('should findObjectMetadataItemById', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFilteredObjectMetadataItems();
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      const res = result.current.findObjectMetadataItemById(
        'ff2881da-89f6-4f15-8f0a-e3f355ea3b94',
      );
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('people');
    });
  });

  it('should findObjectMetadataItemByNamePlural', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useFilteredObjectMetadataItems();
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      const res =
        result.current.findObjectMetadataItemByNamePlural('opportunities');
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('opportunities');
    });
  });
});
