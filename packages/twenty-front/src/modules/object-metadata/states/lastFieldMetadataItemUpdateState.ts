import type { FieldMetadataItemUpdate } from '@/object-metadata/types/FieldMetadataItemUpdate';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastFieldMetadataItemUpdateState =
  createStateV2<FieldMetadataItemUpdate | null>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
