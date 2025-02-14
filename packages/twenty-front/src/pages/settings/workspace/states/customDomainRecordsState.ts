import { createState } from '@ui/utilities/state/utils/createState';
import { CustomDomainValidRecords } from '~/generated/graphql';

export const customDomainRecordsState =
  createState<CustomDomainValidRecords | null>({
    key: 'customDomainRecordsState',
    defaultValue: null,
  });
