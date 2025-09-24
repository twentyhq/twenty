import { createState } from 'twenty-ui/utilities';

export const forceRegisteredActionsByKeyState = createState<
  Record<string, boolean | undefined>
>({
  key: 'forceRegisteredActionsByKeyComponentState',
  defaultValue: {},
});
