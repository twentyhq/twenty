import { createState } from '@/ui/utilities/state/utils/createState';

export const appVersionState = createState<string | undefined>({
  key: 'appVersion',
  defaultValue: undefined,
});
