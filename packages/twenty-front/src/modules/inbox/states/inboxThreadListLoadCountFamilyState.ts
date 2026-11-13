import { createAtomFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomFamilyState';

export const inboxThreadListLoadCountFamilyState = createAtomFamilyState<
  number,
  string
>({
  key: 'inboxThreadListLoadCountFamilyState',
  defaultValue: 0,
});
