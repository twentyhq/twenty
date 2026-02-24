import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const isAppMetadataReadyState = createState<boolean>({
  key: 'isAppMetadataReadyState',
  defaultValue: false,
});
