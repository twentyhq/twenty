import { renderHook } from '@testing-library/react';

import { useCreateEmptyRecordFilterFromFieldMetadataItem } from '@/object-record/record-filter/hooks/useCreateEmptyRecordFilterFromFieldMetadataItem';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

const companyField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('person'),
  fieldName: 'company',
});
const companyNameField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'name',
});

describe('useCreateEmptyRecordFilterFromFieldMetadataItem', () => {
  it('creates a filter through a relation that compares the related field', () => {
    const { result } = renderHook(
      () => useCreateEmptyRecordFilterFromFieldMetadataItem(),
      { wrapper: Wrapper },
    );

    const { newRecordFilter } =
      result.current.createEmptyRelationTargetRecordFilter({
        sourceFieldMetadataItem: companyField,
        relationTargetFieldMetadataItem: companyNameField,
      });

    const { newRecordFilter: plainNameFilter } =
      result.current.createEmptyRecordFilterFromFieldMetadataItem(
        companyNameField,
      );

    expect(newRecordFilter).toMatchObject({
      fieldMetadataId: companyField.id,
      relationTargetFieldMetadataId: companyNameField.id,
      label: `${companyField.label} → ${companyNameField.label}`,
      type: plainNameFilter.type,
      operand: plainNameFilter.operand,
    });
  });
});
