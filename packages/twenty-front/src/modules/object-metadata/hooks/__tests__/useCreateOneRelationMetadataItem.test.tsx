import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useCreateOneRelationMetadataItem } from '@/object-metadata/hooks/useCreateOneRelationMetadataItem';
import { RelationMetadataType } from '~/generated/graphql';

import {
  query,
  responseData,
  variables,
} from '../__mocks__/useCreateOneRelationMetadataItem';

const mocks = [
  {
    request: {
      query,
      variables,
    },
    result: jest.fn(() => ({
      data: {
        createOneRelation: responseData,
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

describe('useCreateOneRelationMetadataItem', () => {
  it('should work as expected', async () => {
    const { result } = renderHook(() => useCreateOneRelationMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.createOneRelationMetadataItem({
        relationType: RelationMetadataType.OneToOne,
        field: {
          label: 'label',
        },
        objectMetadataId: 'objectMetadataId',
        connect: {
          field: {
            label: 'Another label',
          },
          objectMetadataId: 'objectMetadataId1',
        },
      });

      expect(res.data).toEqual({ createOneRelation: responseData });
    });
  });
});
