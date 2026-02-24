import { createState } from '@/ui/utilities/state/jotai/utils/createState';
import { type DomainValidRecords } from '~/generated-metadata/graphql';

export const customDomainRecordsState = createState<{
  customDomainRecords: DomainValidRecords | null;
  isLoading: boolean;
}>({
  key: 'customDomainRecordsState',
  defaultValue: { isLoading: false, customDomainRecords: null },
});
