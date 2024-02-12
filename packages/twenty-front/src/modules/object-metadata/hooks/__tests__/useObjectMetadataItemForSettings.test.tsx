import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import {
  query,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useObjectMetadataItemForSettings';
import { useObjectMetadataItemForSettings } from '@/object-metadata/hooks/useObjectMetadataItemForSettings';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

import { TestApolloMetadataClientProvider } from '../__mocks__/ApolloMetadataClientProvider';

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
      <TestApolloMetadataClientProvider>
        {children}
      </TestApolloMetadataClientProvider>
    </MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useObjectMetadataItemForSettings', () => {
  it('should findActiveObjectMetadataItemBySlug', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useObjectMetadataItemForSettings();
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

        return useObjectMetadataItemForSettings();
      },
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      const res = result.current.findObjectMetadataItemById(
        '20202020-480c-434e-b4c7-e22408b97047',
      );
      expect(res).toBeDefined();
      expect(res?.namePlural).toBe('companies');
    });
  });

  it('should findObjectMetadataItemByNamePlural', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useObjectMetadataItemForSettings();
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

  it('should editObjectMetadataItem', async () => {
    const { result } = renderHook(
      () => {
        const setMetadataItems = useSetRecoilState(objectMetadataItemsState);
        setMetadataItems(mockObjectMetadataItems);

        return useObjectMetadataItemForSettings();
      },
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.editObjectMetadataItem({
        id: 'idToUpdate',
        description: 'newDescription',
        labelPlural: 'labelPlural',
        labelSingular: 'labelSingular',
      });
      expect(res.data).toEqual({ updateOneObject: responseData });
    });
  });
});
