import { type DomainValidRecords } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const customDomainRecordsState = createState<{
  customDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
