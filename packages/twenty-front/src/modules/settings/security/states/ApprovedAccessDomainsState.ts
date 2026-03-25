import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type ApprovedAccessDomain } from '~/generated-metadata/graphql';

export const approvedAccessDomainsState = createAtomState<
  Omit<ApprovedAccessDomain, '__typename'>[]
>({
  key: 'ApprovedAccessDomainsState',
  defaultValue: [],
});
