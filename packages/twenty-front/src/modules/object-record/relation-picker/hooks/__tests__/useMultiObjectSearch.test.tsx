import { gql } from '@apollo/client';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useMultiObjectSearch } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';

const query = gql`
  query FindManyRecordsMultipleMetadataItems(
    $filterNameSingular: NameSingularFilterInput
    $orderByNameSingular: NameSingularOrderByInput
    $lastCursorNameSingular: String
    $limitNameSingular: Float = 5
  ) {
    namePlural(
      filter: $filterNameSingular
      orderBy: $orderByNameSingular
      first: $limitNameSingular
      after: $lastCursorNameSingular
    ) {
      edges {
        node {
          id
        }
        cursor
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
const response = {
  namePlural: {
    edges: [{ node: { id: 'nodeId' }, cursor: 'cursor' }],
    pageInfo: { startCursor: '', hasNextPage: '', endCursor: '' },
  },
};

const mocks = [
  {
    request: {
      query,
      variables: {
        filterNameSingular: { id: { in: ['1'] } },
        orderByNameSingular: { createdAt: 'DescNullsLast' },
        limitNameSingular: 60,
      },
    },
    result: jest.fn(() => ({
      data: response,
    })),
  },
  {
    request: {
      query,
      variables: {
        orderByNameSingular: { createdAt: 'DescNullsLast' },
        limitNameSingular: 60,
      },
    },
    result: jest.fn(() => ({
      data: response,
    })),
  },
  {
    request: {
      query,
      variables: {
        limitNameSingular: 60,
        filterNameSingular: { not: { id: { in: ['1'] } } },
        orderByNameSingular: { createdAt: 'DescNullsLast' },
      },
    },
    result: jest.fn(() => ({
      data: response,
    })),
  },
];

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    <RecoilRoot>{children}</RecoilRoot>
  </MockedProvider>
);

describe('useMultiObjectSearch', () => {
  it('should return object formatted from objectMetadataItemsState', async () => {
    const { result } = renderHook(
      () => ({
        multiObjects: useMultiObjectSearch({
          searchFilterValue: '',
          selectedObjectRecordIds: [
            {
              objectNameSingular: 'nameSingular',
              id: '1',
            },
          ],
        }),
        setObjectMetadata: useSetRecoilState(objectMetadataItemsState),
      }),
      {
        wrapper: Wrapper,
      },
    );
    const objectData: ObjectMetadataItem[] = [
      {
        createdAt: 'createdAt',
        id: 'id',
        isActive: true,
        isCustom: true,
        isSystem: false,
        labelPlural: 'labelPlural',
        labelSingular: 'labelSingular',
        namePlural: 'namePlural',
        nameSingular: 'nameSingular',
        updatedAt: 'updatedAt',
        fields: [],
      },
    ];
    act(() => {
      result.current.setObjectMetadata(objectData);
    });
    await waitFor(() => {
      expect(mocks[0].result).toHaveBeenCalled();
      expect(mocks[1].result).toHaveBeenCalled();
      expect(mocks[2].result).toHaveBeenCalled();
    });
    const expectedData = [
      {
        objectMetadataItem: {
          createdAt: 'createdAt',
          id: 'id',
          isActive: true,
          isCustom: true,
          isSystem: false,
          labelPlural: 'labelPlural',
          labelSingular: 'labelSingular',
          namePlural: 'namePlural',
          nameSingular: 'nameSingular',
          updatedAt: 'updatedAt',
          fields: [],
        },
        record: { id: 'nodeId' },
        recordIdentifier: {
          id: 'nodeId',
          name: '',
          avatarUrl: '',
          avatarType: 'rounded',
          linkToShowPage: '/object/nameSingular/nodeId',
        },
      },
    ];
    expect(result.current.multiObjects.selectedObjectRecords).toStrictEqual(
      expectedData,
    );
    expect(
      result.current.multiObjects.filteredSelectedObjectRecords,
    ).toStrictEqual(expectedData);
    expect(result.current.multiObjects.objectRecordsToSelect).toStrictEqual(
      expectedData,
    );
  });
});
