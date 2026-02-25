import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const forceRegisteredActionsByKeyState = createAtomState<
  Record<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsByKeyComponentState',
  defaultValue: {},
});
