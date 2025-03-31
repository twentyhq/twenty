import { createState } from "twenty-ui";
import { ApprovedAccessDomain } from '~/generated/graphql';

export const approvedAccessDomainsState = createState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
