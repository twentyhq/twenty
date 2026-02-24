import { type PublicDomain } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const selectedPublicDomainState = createStateV2<
  PublicDomain | undefined
>({
  key: 'selectedPublicDomainState',
  defaultValue: undefined,
});
