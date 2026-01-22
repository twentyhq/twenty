import type { FieldMetadataItemUpdate } from '@/object-metadata/types/FieldMetadataItemUpdate';
import { createState } from 'twenty-ui/utilities';

export const lastFieldMetadataItemUpdateState =
  createState<FieldMetadataItemUpdate | null>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
