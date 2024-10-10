import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { act, ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationDefinitionType } from '~/generated/graphql';

import {
  FIELD_METADATA_ID,
  FIELD_RELATION_METADATA_ID,
  objectMetadataId,
  queries,
  RELATION_METADATA_ID,
  responseData,
  variables,
} from '../__mocks__/useFieldMetadataItem';

const fieldMetadataItem: FieldMetadataItem = {
  id: FIELD_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.Text,
  updatedAt: '',
};

const fieldRelationMetadataItem: FieldMetadataItem = {
  id: FIELD_RELATION_METADATA_ID,
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.Relation,
  updatedAt: '',
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
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useFieldMetadataItem', () => {
  it('should activateMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.activateMetadataField(fieldMetadataItem);

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
      const res =
        await result.current.deactivateMetadataField(fieldMetadataItem);

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
