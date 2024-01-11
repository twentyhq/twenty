import { ObjectMetadataConfig } from '@/object-record/record-table/types/ObjectMetadataConfig';
import { createStateScopeMap } from '@/ui/utilities/recoil-scope/utils/createStateScopeMap';

export const objectMetadataConfigStateScopeMap =
  createStateScopeMap<ObjectMetadataConfig | null>({
    key: 'objectMetadataConfigStateScopeMap',
    defaultValue: null,
  });
