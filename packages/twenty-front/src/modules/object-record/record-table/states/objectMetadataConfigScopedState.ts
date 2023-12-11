import { ObjectMetadataConfig } from '@/object-record/record-table/types/ObjectMetadataConfig';
import { createScopedState } from '@/ui/utilities/recoil-scope/utils/createScopedState';

export const objectMetadataConfigScopedState =
  createScopedState<ObjectMetadataConfig | null>({
    key: 'objectMetadataConfigScopedState',
    defaultValue: null,
  });
