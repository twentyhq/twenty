import { createState } from '@/ui/utilities/state/utils/createState';

export const forceRegisteredActionsByKeyState = createState<
  Record<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsByKeyComponentState',
  defaultValue: {},
});
