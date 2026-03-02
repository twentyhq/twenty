import type { FieldMetadataItemUpdate } from '@/object-metadata/types/FieldMetadataItemUpdate';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const lastFieldMetadataItemUpdateState =
  createAtomState<FieldMetadataItemUpdate | null>({
    key: 'lastFieldMetadataItemUpdateState',
    defaultValue: null,
  });
