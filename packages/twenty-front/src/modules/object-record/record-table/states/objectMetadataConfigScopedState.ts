import { ObjectMetadataConfig } from '@/object-record/record-table/types/ObjectMetadataConfig';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectMetadataConfigScopedState =
  createStateScopeMap<ObjectMetadataConfig | null>({
    key: 'objectMetadataConfigScopedState',
    defaultValue: null,
  });
