import {
  RecordSharePrincipalType,
  type SharingRule,
} from '~/generated-metadata/graphql';

const BACKFILL_GRANTEE_PRINCIPAL_TYPES = [
  RecordSharePrincipalType.EVERYONE,
  RecordSharePrincipalType.ROLE,
];

export const isBackfillSharingRule = (
  sharingRule: Pick<
    SharingRule,
    'isActive' | 'granteePrincipalType' | 'rowLevelPermissionPredicates'
  >,
) =>
  sharingRule.isActive &&
  BACKFILL_GRANTEE_PRINCIPAL_TYPES.includes(sharingRule.granteePrincipalType) &&
  (sharingRule.rowLevelPermissionPredicates?.length ?? 0) === 0;
