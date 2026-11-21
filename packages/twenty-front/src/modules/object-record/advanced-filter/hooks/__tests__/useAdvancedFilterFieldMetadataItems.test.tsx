import { useAdvancedFilterFieldMetadataItems } from '@/object-record/advanced-filter/hooks/useAdvancedFilterFieldMetadataItems';
import { AdvancedFilterContext } from '@/object-record/advanced-filter/states/context/AdvancedFilterContext';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { FieldMetadataType } from 'twenty-shared/types';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const MetadataWrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: [],
});

const getFieldTypes = (shouldHideRelationFields?: boolean) => {
  const { result } = renderHook(() => useAdvancedFilterFieldMetadataItems(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <MetadataWrapper>
        <AdvancedFilterContext.Provider
          value={{
            objectMetadataItem: getMockObjectMetadataItemOrThrow('task'),
            shouldHideRelationFields,
          }}
        >
          {children}
        </AdvancedFilterContext.Provider>
      </MetadataWrapper>
    ),
  });

  return result.current.advancedFilterFieldMetadataItems.map(
    ({ type }) => type,
  );
};

describe('useAdvancedFilterFieldMetadataItems', () => {
  it('offers the relation fields of the object by default', () => {
    expect(getFieldTypes()).toContain(FieldMetadataType.RELATION);
  });

  it('leaves relation fields out when they should be hidden', () => {
    const fieldTypes = getFieldTypes(true);

    expect(fieldTypes).not.toHaveLength(0);
    expect(fieldTypes).not.toContain(FieldMetadataType.RELATION);
  });
});
