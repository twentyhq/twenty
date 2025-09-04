import { type HostnameValidRecords } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const customDomainRecordsState = createState<{
  customDomainRecords: HostnameValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
