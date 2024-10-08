import { renderHook } from '@testing-library/react';
import { Nullable } from 'twenty-ui';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('useColumnDefinitionsFromFieldMetadata', () => {
  it('should return empty definitions if no object is passed', () => {
    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
    );

    expect(Array.isArray(result.current.columnDefinitions)).toBe(true);
    expect(Array.isArray(result.current.filterDefinitions)).toBe(true);
    expect(Array.isArray(result.current.sortDefinitions)).toBe(true);
    expect(result.current.columnDefinitions.length).toBe(0);
    expect(result.current.filterDefinitions.length).toBe(0);
    expect(result.current.sortDefinitions.length).toBe(0);
  });

  it('should return expected definitions', () => {
    const companyObjectMetadata = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'company',
    );

    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
      {
        initialProps: companyObjectMetadata,
      },
    );

    const { columnDefinitions, filterDefinitions, sortDefinitions } =
      result.current;

    expect(columnDefinitions.length).toBe(21);
    expect(filterDefinitions.length).toBe(14);
    expect(sortDefinitions.length).toBe(14);
  });
});
