import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useMemo } from 'react';

export const useFieldsWidgetFields = (
  objectMetadataItem: EnrichedObjectMetadataItem | undefined,
): FieldMetadataItem[] =>
  useMemo(() => objectMetadataItem?.fields ?? [], [objectMetadataItem]);
