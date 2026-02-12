import { type DomainValidRecords } from '~/generated-metadata/graphql';
import { createState } from '@/ui/utilities/state/utils/createState';

export const publicDomainRecordsState = createState<{
  publicDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'publicDomainRecordsState',
  defaultValue: { isLoading: false, publicDomainRecords: null },
});
