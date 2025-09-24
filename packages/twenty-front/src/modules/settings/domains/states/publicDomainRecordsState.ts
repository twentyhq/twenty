import { type DomainValidRecords } from '~/generated/graphql';
import { createState } from 'twenty-ui/utilities';

export const publicDomainRecordsState = createState<{
  publicDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'publicDomainRecordsState',
  defaultValue: { isLoading: false, publicDomainRecords: null },
});
