import { createState } from '@ui/utilities/state/utils/createState';
import { ApprovedAccessDomain } from '~/generated/graphql';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
