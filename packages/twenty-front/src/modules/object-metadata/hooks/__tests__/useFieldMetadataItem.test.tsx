import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useFieldMetadataItem } from '@/object-metadata/hooks/useFieldMetadataItem';
import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from '~/generated/graphql';

import {
  objectMetadataId,
  queries,
  responseData,
  variables,
} from '../__mocks__/useFieldMetadataItem';

const fieldMetadataItem: FieldMetadataItem = {
  id: '2c43466a-fe9e-4005-8d08-c5836067aa6c',
  createdAt: '',
  label: 'label',
  name: 'name',
  type: FieldMetadataType.Text,
  updatedAt: '',
};

const mocks = [
  {
    request: {
      query: queries.eraseMetadataField,
      variables: variables.eraseMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        deleteOneField: responseData.default,
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
      variables: variables.disableMetadataField,
    },
    result: jest.fn(() => ({
      data: {
        updateOneField: responseData.default,
      },
    })),
  },
  {
    request: {
      query: queries.activateMetadataField,
      variables: variables.editMetadataField,
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

  it('should disableMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.disableMetadataField(fieldMetadataItem);

      expect(res.data).toEqual({
        updateOneField: responseData.default,
      });
    });
  });

  it('should eraseMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.eraseMetadataField(fieldMetadataItem);

      expect(res.data).toEqual({
        deleteOneField: responseData.default,
      });
    });
  });

  it('should editMetadataField', async () => {
    const { result } = renderHook(() => useFieldMetadataItem(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const res = await result.current.editMetadataField({
        id: fieldMetadataItem.id,
        label: 'New label',
      });

      expect(res.data).toEqual({
        updateOneField: responseData.default,
      });
    });
  });
});
