import { renderHook } from '@testing-library/react';
import { act } from 'react';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

import {
  FIELD_METADATA_ID,
  FIELD_RELATION_METADATA_ID,
  objectMetadataId,
  queries,
  responseData,
  variables,
} from '@/object-metadata/hooks/__mocks__/useFieldMetadataItem';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

import {
  query as findManyObjectMetadataItemsQuery,
  responseData as findManyObjectMetadataItemsResponseData,
} from '@/object-metadata/hooks/__mocks__/useFindManyObjectMetadataItems';
import { jestExpectSuccessfulMetadataRequestResult } from '@/object-metadata/hooks/__tests__/utils/jest-expect-metadata-request-status.util';
import { GET_CURRENT_USER } from '@/users/graphql/queries/getCurrentUser';
import { mockedUserData } from '~/testing/mock-data/users';

jest.mock('@/object-metadata/hooks/useUpdateOneFieldMetadataItem', () => ({
  useUpdateOneFieldMetadataItem: () => ({
    updateOneFieldMetadataItem: jest.fn().mockResolvedValue({
      status: 'successful',
      response: {
        data: {
          updateOneField: responseData.default,
        },
      },
    }),
  }),
}));

const fieldMetadataItem: FieldMetadataItem = {
  id: FIELD_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.TEXT,
  updatedAt: '',
  isLabelSyncedWithName: true,
};

const fieldRelationMetadataItem: FieldMetadataItem = {
  id: FIELD_RELATION_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.RELATION,
  updatedAt: '',
  isLabelSyncedWithName: true,
  relation: {
    type: RelationType.ONE_TO_MANY,
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
      query: GET_CURRENT_USER,
      variables: {},
    },
    result: jest.fn(() => ({
      data: {
        currentUser: mockedUserData,
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
      query: queries.deleteMetadataField,
      variables: variables.deleteMetadataFieldRelation,
    },
    result: jest.fn(() => ({
      data: {
        deleteOneField: responseData.fieldRelation,
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
      const response = await result.current.activateMetadataField(
        fieldMetadataItem.id,
        objectMetadataId,
      );

      jestExpectSuccessfulMetadataRequestResult(response);

      expect(response.response).toEqual({
        data: {
          updateOneField: responseData.default,
        },
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
        type: FieldMetadataType.TEXT,
        name: 'fieldName',
        isLabelSyncedWithName: true,
      });
      jestExpectSuccessfulMetadataRequestResult(res);

      expect(res.response).toEqual({
        data: {
          createOneField: responseData.createMetadataField,
        },
      });
    });
  });

  it('should deactivateMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const response = await result.current.deactivateMetadataField(
        fieldMetadataItem.id,
        objectMetadataId,
      );

      jestExpectSuccessfulMetadataRequestResult(response);
      expect(response.response.data).toEqual({
        updateOneField: responseData.default,
      });
    });
  });

  it('should deleteOneFieldMetadataItem when calling deleteMetadataField for a non-relation field', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.deleteMetadataField({
        idToDelete: fieldMetadataItem.id,
        objectMetadataId,
      });
      jestExpectSuccessfulMetadataRequestResult(res);

      expect(res.response).toEqual({
        data: {
          deleteOneField: responseData.default,
        },
      });
    });
  });

  it('should deleteOneFieldMetadataItem when calling deleteMetadataField for a relation field', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.deleteMetadataField({
        idToDelete: fieldRelationMetadataItem.id,
        objectMetadataId,
      });
      jestExpectSuccessfulMetadataRequestResult(res);

      expect(res.response).toEqual({
        data: {
          deleteOneField: responseData.fieldRelation,
        },
      });
    });
  });
});
