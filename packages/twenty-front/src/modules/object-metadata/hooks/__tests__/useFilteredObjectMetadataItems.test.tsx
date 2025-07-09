import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useFilteredObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

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
  <RecoilRoot
    initializeState={({ set }) =>
      set(objectMetadataItemsState, generatedMockObjectMetadataItems)
    }
  >
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useFilteredObjectMetadataItems', () => {
  it('should findActiveObjectMetadataItemByNamePlural', async () => {
    const { result } = renderHook(useFilteredObjectMetadataItems, {
      wrapper: Wrapper,
    });

    act(() => {
      const res =
        result.current.findActiveObjectMetadataItemByNamePlural('people');
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('people');
    });
  });

  it('should findObjectMetadataItemByNamePlural', async () => {
    const { result } = renderHook(useFilteredObjectMetadataItems, {
      wrapper: Wrapper,
    });

    act(() => {
      const res = result.current.findObjectMetadataItemByNamePlural('people');
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('people');
    });
  });

  it('should findObjectMetadataItemById', async () => {
    const peopleObjectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.namePlural === 'people',
    );

    const { result } = renderHook(useFilteredObjectMetadataItems, {
      wrapper: Wrapper,
    });

    act(() => {
      const res = result.current.findObjectMetadataItemById(
        peopleObjectMetadata?.id,
      );
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('people');
    });
  });

  it('should findObjectMetadataItemByNamePlural', async () => {
    const { result } = renderHook(useFilteredObjectMetadataItems, {
      wrapper: Wrapper,
    });

    act(() => {
      const res =
        result.current.findObjectMetadataItemByNamePlural('opportunities');
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('opportunities');
    });
  });
});
