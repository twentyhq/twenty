import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { mockedCompanyObjectMetadataItem } from '@/object-record/record-field/__mocks__/fieldDefinitions';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';

import { useFieldPreview } from '../useFieldPreview';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useFieldPreview', () => {
  it('returns default preview data if no records are found', () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'linkedinLink',
    )!;

    // When
    const { result } = renderHook(
      () => useFieldPreview({ fieldMetadataItem, objectMetadataItem }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toEqual({
      entityId: 'company-linkedinLink-preview-field-form',
      fieldName: 'linkedinLink',
      fieldPreviewValue: { label: '', url: 'www.twenty.com' },
      isLabelIdentifier: false,
      record: null,
    });
  });

  it('returns default preview data for a label identifier field if no records are found', () => {
    // Given
    const objectMetadataItem = mockedCompanyObjectMetadataItem;
    const fieldMetadataItem = mockedCompanyObjectMetadataItem.fields.find(
      ({ name }) => name === 'name',
    )!;

    // When
    const { result } = renderHook(
      () => useFieldPreview({ fieldMetadataItem, objectMetadataItem }),
      { wrapper: Wrapper },
    );

    // Then
    expect(result.current).toEqual({
      entityId: 'company-name-preview-field-form',
      fieldName: 'name',
      fieldPreviewValue: 'Company',
      isLabelIdentifier: true,
      record: null,
    });
  });
});
