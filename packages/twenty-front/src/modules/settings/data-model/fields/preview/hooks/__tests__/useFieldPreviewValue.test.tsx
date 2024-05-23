import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { ObjectMetadataItemsProvider } from '@/object-metadata/components/ObjectMetadataItemsProvider';
import { FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { FieldMetadataType } from '~/generated/graphql';
import {
  mockedCompanyObjectMetadataItem,
  mockedOpportunityObjectMetadataItem,
  mockedPersonObjectMetadataItem,
} from '~/testing/mock-data/metadata';

import { useFieldPreviewValue } from '../useFieldPreviewValue';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        <ObjectMetadataItemsProvider>{children}</ObjectMetadataItemsProvider>
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFieldPreviewValue', () => {
  it("returns the object's label identifier preview value if isLabelIdentifier is true", () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = {
      name: '',
      type: FieldMetadataType.Text,
    };
    const isLabelIdentifier = true;

    // When
    const { result } = renderHook(
      () =>
        useFieldPreviewValue({
          fieldMetadataItem,
          isLabelIdentifier,
          objectMetadataItem,
        }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toEqual({ name: 'Company' });
  });

  it("returns the relation object's label identifier preview value for a Relation field", () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = {
      name: 'people',
      type: FieldMetadataType.Relation,
    };
    const relationObjectMetadataItem = mockedPersonObjectMetadataItem;

    // When
    const { result } = renderHook(
      () =>
        useFieldPreviewValue({
          fieldMetadataItem,
          objectMetadataItem,
          relationObjectMetadataItem,
        }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toEqual({
      name: {
        firstName: 'John',
        lastName: 'Doe',
      },
    });
  });

  it("returns the field's preview value for a Select field", () => {
    // Given
    const objectMetadataItem = mockedOpportunityObjectMetadataItem;
    const fieldName = 'stage';
    const fieldMetadataItem = mockedOpportunityObjectMetadataItem.fields.find(
      ({ name, type }) =>
        name === fieldName && type === FieldMetadataType.Select,
    );

    if (!fieldMetadataItem) {
      throw new Error(`Field ${fieldName} not found`);
    }

    // When
    const { result } = renderHook(
      () =>
        useFieldPreviewValue({
          fieldMetadataItem,
          objectMetadataItem,
        }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toBe('NEW');
  });

  it("returns the field's preview value for a Multi-Select field", () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const options: FieldMetadataItemOption[] = [
      {
        color: 'blue',
        label: 'Blue',
        value: 'BLUE',
        id: '1',
        position: 0,
      },
      {
        color: 'red',
        label: 'Red',
        value: 'RED',
        id: '2',
        position: 1,
      },
      {
        color: 'green',
        label: 'Green',
        value: 'GREEN',
        id: '3',
        position: 2,
      },
    ];
    const fieldMetadataItem = {
      name: 'industry',
      type: FieldMetadataType.MultiSelect,
      options,
    };

    // When
    const { result } = renderHook(
      () =>
        useFieldPreviewValue({
          fieldMetadataItem,
          objectMetadataItem,
        }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toEqual(options.map(({ value }) => value));
  });

  it("returns the field's preview value for other field types", () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldName = 'employees';
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === fieldName,
    );

    if (!fieldMetadataItem) {
      throw new Error(`Field ${fieldName} not found`);
    }

    // When
    const { result } = renderHook(
      () =>
        useFieldPreviewValue({
          fieldMetadataItem,
          objectMetadataItem,
        }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toBe(2000);
  });
});
