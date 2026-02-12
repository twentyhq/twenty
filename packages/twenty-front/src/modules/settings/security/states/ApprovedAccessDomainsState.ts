import { type ApprovedAccessDomain } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
