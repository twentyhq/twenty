import { type PublicDomain } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const selectedPublicDomainState = createAtomState<
  PublicDomain | undefined
>({
  key: 'selectedPublicDomainState',
  defaultValue: undefined,
});
