import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const webPushVapidPublicKeyState = createAtomState<string | null>({
  key: 'webPushVapidPublicKeyState',
  defaultValue: null,
});
