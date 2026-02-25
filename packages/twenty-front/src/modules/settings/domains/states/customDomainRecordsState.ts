import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
import { type DomainValidRecords } from '~/generated-metadata/graphql';

export const customDomainRecordsState = createAtomState<{
  customDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
