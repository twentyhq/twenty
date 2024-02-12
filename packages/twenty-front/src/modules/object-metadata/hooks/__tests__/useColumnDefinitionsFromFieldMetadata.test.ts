import { renderHook } from '@testing-library/react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { Nullable } from '~/types/Nullable';

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

  it('should return empty definitions if object has no fields matching criteria', () => {
    const mockObjectMetadataItems = getObjectMetadataItemsMock();

    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
      {
        initialProps: mockObjectMetadataItems[0],
      },
    );

    expect(result.current.columnDefinitions.length).toBe(0);
    expect(result.current.filterDefinitions.length).toBe(0);
    expect(result.current.sortDefinitions.length).toBe(0);
  });

  it('should return expected definitions', () => {
    const mockObjectMetadataItems = getObjectMetadataItemsMock();

    const { result } = renderHook(
      (objectMetadataItem?: Nullable<ObjectMetadataItem>) => {
        return useColumnDefinitionsFromFieldMetadata(objectMetadataItem);
      },
      {
        initialProps: mockObjectMetadataItems[1],
      },
    );

    const { columnDefinitions, filterDefinitions, sortDefinitions } =
      result.current;

    expect(columnDefinitions.length).toBe(3);
    expect(filterDefinitions.length).toBe(3);
    expect(sortDefinitions.length).toBe(3);

    expect(columnDefinitions[0].label).toBe('Expiration date');
    expect(columnDefinitions[1].label).toBe('Name');
    expect(columnDefinitions[2].label).toBe('Revocation date');

    expect(filterDefinitions[0].label).toBe('Expiration date');
    expect(filterDefinitions[1].label).toBe('Name');
    expect(filterDefinitions[2].label).toBe('Revocation date');

    expect(sortDefinitions[0].label).toBe('Expiration date');
    expect(sortDefinitions[1].label).toBe('Name');
    expect(sortDefinitions[2].label).toBe('Revocation date');
  });
});
