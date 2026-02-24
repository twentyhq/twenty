import { createState } from '@/ui/utilities/state/jotai/utils/createState';

export const forceRegisteredActionsByKeyState = createState<
  Record<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsByKeyComponentState',
  defaultValue: {},
});
