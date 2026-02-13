import { type DomainValidRecords } from '~/generated-metadata/graphql';
import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';

export const publicDomainRecordsState = createStateV2<{
  publicDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'publicDomainRecordsState',
  defaultValue: { isLoading: false, publicDomainRecords: null },
});
