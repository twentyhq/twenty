import { createState } from '@/ui/utilities/state/utils/createState';

export const isObjectMetadataLoadedState = createState<boolean>({
  key: 'isObjectMetadataLoadedState',
  defaultValue: false,
});
