import { msg } from '@lingui/core/macro';

export const CORE_AGENT_DATA_ACCESS_PERMISSIONS = [
  { key: 'canReadObjectRecords', label: msg`See records` },
  { key: 'canUpdateObjectRecords', label: msg`Edit records` },
  { key: 'canSoftDeleteObjectRecords', label: msg`Delete records` },
  { key: 'canDestroyObjectRecords', label: msg`Permanently delete records` },
] as const;
