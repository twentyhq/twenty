import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
import { type DomainValidRecords } from '~/generated-metadata/graphql';

export const customDomainRecordsState = createStateV2<{
  customDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
