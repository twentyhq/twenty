import { createState } from "twenty-ui";
import { CustomDomainValidRecords } from '~/generated/graphql';

export const customDomainRecordsState = createState<{
  customDomainRecords: CustomDomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
