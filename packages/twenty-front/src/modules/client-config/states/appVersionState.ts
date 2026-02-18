import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const appVersionState = createStateV2<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
