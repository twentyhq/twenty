import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useCreateOneObjectRecordMetadataItem } from '@/object-metadata/hooks/useCreateOneObjectMetadataItem';

import { TestApolloMetadataClientProvider } from '../__mocks__/ApolloMetadataClientProvider';
import {
  query,
  responseData,
  variables,
} from '../__mocks__/useCreateOneObjectRecordMetadataItem';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createOneObject: responseData,
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

describe('useCreateOneObjectRecordMetadataItem', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(
      () => useCreateOneObjectRecordMetadataItem(),
      {
        wrapper: Wrapper,
      },
    );

    await act(async () => {
      const res = await result.current.createOneObjectMetadataItem({
        labelPlural: 'View Filters',
        labelSingular: 'View Filter',
        nameSingular: 'viewFilter',
        namePlural: 'viewFilters',
      });

      expect(res.data).toEqual({ createOneObject: responseData });
    });
  });
});
