import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const lastShowPageRecordIdState = createStateV2<string | null>({
  key: 'lastShowPageRecordIdState',
  defaultValue: null,
});
