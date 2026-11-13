import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const inboxThreadRecordUpdateCountState = createAtomState<number>({
  key: 'inboxThreadRecordUpdateCountState',
  defaultValue: 0,
});
