import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const isAppMetadataReadyState = createStateV2<boolean>({
  key: 'isAppMetadataReadyState',
  defaultValue: false,
});
