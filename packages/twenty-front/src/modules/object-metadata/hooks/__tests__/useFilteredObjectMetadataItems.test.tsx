import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import {
  query,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useFilteredObjectMetadataItems';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';
import { isDefined } from 'twenty-shared/utils';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

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

const Wrapper = ({ children }: { children: ReactNode }) => {
  setTestObjectMetadataItemsInMetadataStore(
    jotaiStore,
    getTestEnrichedObjectMetadataItemsMock(),
  );

  return (
    <JotaiProvider store={jotaiStore}>
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    </JotaiProvider>
  );
};

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
    const peopleObjectMetadata = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.namePlural === 'people',
    );

    if (!isDefined(peopleObjectMetadata)) {
      throw new Error('People object metadata not found');
    }

    const { result } = renderHook(useFilteredObjectMetadataItems, {
      wrapper: Wrapper,
    });

    act(() => {
      const res = result.current.findObjectMetadataItemById(
        peopleObjectMetadata.id,
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
