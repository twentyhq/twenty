import type { FieldMetadataItemUpdate } from '@/object-metadata/types/FieldMetadataItemUpdate';
import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const lastFieldMetadataItemUpdateState =
  createState<FieldMetadataItemUpdate | null>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
