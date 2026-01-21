import type { LastFieldMetadataItemUpdate } from '@/object-metadata/types/LastFieldMetadataItemUpdate';
import { createState } from 'twenty-ui/utilities';

export const lastFieldMetadataItemUpdateState =
  createState<LastFieldMetadataItemUpdate>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
