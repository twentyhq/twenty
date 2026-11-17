import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxNotifiedLastActivityAtByThreadIdState = createAtomState<
  Record<string, string>
>({
  key: 'inboxNotifiedLastActivityAtByThreadIdState',
  defaultValue: {},
});
