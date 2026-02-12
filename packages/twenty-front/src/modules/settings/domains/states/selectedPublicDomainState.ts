import { type PublicDomain } from '~/generated-metadata/graphql';
import { createState } from 'twenty-ui/utilities';

export const selectedPublicDomainState = createState<PublicDomain | undefined>({
  key: 'selectedPublicDomainState',
  defaultValue: undefined,
});
