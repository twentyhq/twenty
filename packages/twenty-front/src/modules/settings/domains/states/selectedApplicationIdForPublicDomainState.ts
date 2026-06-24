import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedApplicationIdForPublicDomainState = createAtomState<
  string | undefined
>({
  key: 'selectedApplicationIdForPublicDomainState',
  defaultValue: undefined,
});
