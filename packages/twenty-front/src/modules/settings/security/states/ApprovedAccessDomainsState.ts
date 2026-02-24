import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type ApprovedAccessDomain } from '~/generated-metadata/graphql';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
