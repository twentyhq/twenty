import { createState } from '@ui/utilities/state/utils/createState';
import { CustomDomainValidRecords } from '~/generated/graphql';

export const customDomainRecordsState = createState<{
  customDomainRecords: CustomDomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
