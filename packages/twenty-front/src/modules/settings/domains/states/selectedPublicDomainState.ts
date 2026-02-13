import { type PublicDomain } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const selectedPublicDomainState = createState<PublicDomain | undefined>({
  key: 'selectedPublicDomainState',
  defaultValue: undefined,
});
