import { createState } from '@ui/utilities/state/utils/createState';
import { WorkspaceTrustedDomain } from '~/generated/graphql';

export const workspaceTrustedDomainsState = createState<
  Omit<WorkspaceTrustedDomain, '__typename'>[]
>({
  key: 'WorkspaceTrustedDomainState',
  defaultValue: [],
});
