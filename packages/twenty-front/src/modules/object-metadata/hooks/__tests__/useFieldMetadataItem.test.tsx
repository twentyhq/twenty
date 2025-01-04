import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationDefinitionType } from '~/generated/graphql';

import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import {
  FIELD_METADATA_ID,
  FIELD_RELATION_METADATA_ID,
  objectMetadataId,
  queries,
  RELATION_METADATA_ID,
  responseData,
  variables,
} from '../__mocks__/useFieldMetadataItem';

import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '../__mocks__/useFindManyObjectMetadataItems';

const fieldMetadataItem: FieldMetadataItem = {
  id: FIELD_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.Text,
  updatedAt: '',
  isLabelSyncedWithName: true,
};

const fieldRelationMetadataItem: FieldMetadataItem = {
  id: FIELD_RELATION_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.Relation,
  updatedAt: '',
  isLabelSyncedWithName: true,
  relationDefinition: {
    relationId: RELATION_METADATA_ID,
    direction: RelationDefinitionType.OneToMany,
    sourceFieldMetadata: {
      id: 'e5903d91-9b10-4f3e-b761-35c36e93b7c1',
      name: 'sourceField',
    },
    targetFieldMetadata: {
      id: 'd23d82d4-690b-489f-a8e3-fc5ed01a91f6',
      name: 'targetField',
    },
    sourceObjectMetadata: {
      id: 'bf46be8a-7c47-45a7-b2f1-30f49e14fbd9',
      nameSingular: 'sourceObject',
      namePlural: 'sourceObjects',
    },
    targetObjectMetadata: {
      id: '987c0489-2855-4a63-bb81-93692e51b2a9',
      nameSingular: 'targetObject',
      namePlural: 'targetObjects',
    },
  },
};

const mocks = [
  {
    request: {
      query: queries.findManyViewsQuery,
      variables: {
        filter: {
          objectMetadataId: { eq: '25611fce-6637-4089-b0ca-91afeec95784' },
        },
      },
    },
    result: jest.fn(() => ({
      data: {
        views: {
          __typename: 'ViewConnection',
          totalCount: 0,
          pageInfo: {
            __typename: 'PageInfo',
            hasNextPage: false,
            startCursor: '',
            endCursor: '',
          },
          edges: [],
        },
      },
    })),
  },
  {
    request: {
      query: queries.deleteMetadataField,
      variables: variables.deleteMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        deleteOneField: responseData.default,
      },
    })),
  },
  {
    request: {
      query: queries.deleteMetadataFieldRelation,
      variables: variables.deleteMetadataFieldRelation,
    },
    result: jest.fn(() => ({
      data: {
        deleteOneRelation: responseData.fieldRelation,
      },
    })),
  },
  {
    request: {
      query: queries.activateMetadataField,
      variables: variables.activateMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        updateOneField: responseData.default,
      },
    })),
  },
  {
    request: {
      query: queries.createMetadataField,
      variables: variables.createMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        createOneField: responseData.createMetadataField,
      },
    })),
  },
  {
    request: {
      query: queries.activateMetadataField,
      variables: variables.deactivateMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        updateOneField: responseData.default,
      },
    })),
  },
  {
    request: {
      query: queries.getCurrentUser,
      variables: {},
    },
    result: jest.fn(() => ({
      data: responseData.getCurrentUser,
    })),
  },
  {
    request: {
      query: queries.getCurrentUser,
      variables: {},
    },
    result: jest.fn(() => ({
      data: responseData.getCurrentUser,
    })),
  },
  {
    request: {
      query: findManyObjectMetadataItemsQuery,
      variables: {},
    },
    result: jest.fn(() => ({
      data: findManyObjectMetadataItemsResponseData,
    })),
  },
];

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

describe('useFieldMetadataItem', () => {
  it('should activateMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.activateMetadataField(
        fieldMetadataItem.id,
        objectMetadataId,
      );

      expect(res.data).toEqual({
        updateOneField: responseData.default,
      });
    });
  });

  it('should createMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.createMetadataField({
        label: 'fieldLabel',
        objectMetadataId,
        type: FieldMetadataType.Text,
        name: 'fieldName',
        isLabelSyncedWithName: true,
      });

      expect(res.data).toEqual({
        createOneField: responseData.createMetadataField,
      });
    });
  });

  it('should deactivateMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.deactivateMetadataField(
        fieldMetadataItem.id,
        objectMetadataId,
      );

      expect(res.data).toEqual({
        updateOneField: responseData.default,
      });
    });
  });

  it('should deleteOneFieldMetadataItem when calling deleteMetadataField for a non-relation field', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.deleteMetadataField(fieldMetadataItem);

      expect(res.data).toEqual({
        deleteOneField: responseData.default,
      });
    });
  });

  it('should deleteOneFieldMetadataItem when calling deleteMetadataField for a relation field', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.deleteMetadataField(
        fieldRelationMetadataItem,
      );

      expect(res.data).toEqual({
        deleteOneRelation: responseData.fieldRelation,
      });
    });
  });
});
