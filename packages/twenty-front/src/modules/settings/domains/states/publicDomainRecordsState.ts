import { type DomainValidRecords } from '~/generated-metadata/graphql';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const publicDomainRecordsState = createAtomState<{
  publicDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'publicDomainRecordsState',
  defaultValue: { isLoading: false, publicDomainRecords: null },
});
