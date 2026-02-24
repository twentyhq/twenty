import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const forceRegisteredActionsByKeyState = createStateV2<
  Record<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsByKeyComponentState',
  defaultValue: {},
});
