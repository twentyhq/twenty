import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type ApprovedAccessDomain } from '~/generated-metadata/graphql';

export const approvedAccessDomainsState = createStateV2<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
