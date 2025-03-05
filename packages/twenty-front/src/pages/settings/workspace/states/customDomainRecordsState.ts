import { createState } from '@ui/utilities/state/utils/createState';
import { CustomDomainValidRecords } from '~/generated/graphql';

export const customDomainRecordsState = createState<{
  customDomainRecords: CustomDomainValidRecords | null;
  loading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { loading: false, customDomainRecords: null },
});
