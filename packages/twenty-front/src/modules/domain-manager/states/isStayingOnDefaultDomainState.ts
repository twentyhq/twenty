import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const isStayingOnDefaultDomainState = createAtomState<boolean>({
  key: 'isStayingOnDefaultDomainState',
  defaultValue: false,
  useSessionStorage: true,
});
