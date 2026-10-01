import { SystemPermissionFlag } from 'twenty-shared/constants';
import { IconMail } from 'twenty-ui/icon';

import { buildPermissionSummaryFromRoleGrants } from '@/marketplace/utils/buildPermissionSummaryFromRoleGrants';
import { ApplicationUpgradeRoleGrantType } from '~/generated-metadata/graphql';

const COMPANY_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000001';
const SALARY_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000002';
const UNKNOWN_UNIVERSAL_IDENTIFIER = '20202020-0000-4000-8000-000000000003';
const ANOTHER_UNKNOWN_UNIVERSAL_IDENTIFIER =
  '20202020-0000-4000-8000-000000000004';

const objects = [
  {
    universalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
    labelPlural: 'Companies',
    fields: [
      { universalIdentifier: SALARY_UNIVERSAL_IDENTIFIER, label: 'Salary' },
    ],
  },
];

const permissionFlags = [
  {
    key: 'SEND_EMAIL_TOOL',
    description: 'Send emails via connected accounts',
    Icon: IconMail,
  },
];

const buildGrant = (
  grant: Partial<{
    type: ApplicationUpgradeRoleGrantType;
    action: string;
    objectUniversalIdentifier: string;
    fieldUniversalIdentifier: string;
    permissionFlagUniversalIdentifier: string;
  }>,
) => ({
  type: ApplicationUpgradeRoleGrantType.ALL_SETTINGS,
  action: null,
  objectUniversalIdentifier: null,
  fieldUniversalIdentifier: null,
  permissionFlagUniversalIdentifier: null,
  ...grant,
});

const getLabels = (grants: ReturnType<typeof buildGrant>[]) =>
  buildPermissionSummaryFromRoleGrants({
    grants,
    objects,
    permissionFlags,
  }).map(({ label }) => label);

describe('buildPermissionSummaryFromRoleGrants', () => {
  it('names the object, field and row-level restriction a grant covers', () => {
    expect(
      getLabels([
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.OBJECT_RECORDS,
          action: 'canSoftDeleteObjectRecords',
          objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
        }),
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.FIELD_VALUE,
          action: 'canReadFieldValue',
          objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
          fieldUniversalIdentifier: SALARY_UNIVERSAL_IDENTIFIER,
        }),
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.ROW_LEVEL_RESTRICTION,
          objectUniversalIdentifier: COMPANY_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([
      'Delete Companies',
      'See Salary on Companies',
      'Access Companies beyond their row-level restrictions',
    ]);
  });

  it('describes a system permission flag with its role settings description', () => {
    expect(
      getLabels([
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.PERMISSION_FLAG,
          permissionFlagUniversalIdentifier:
            SystemPermissionFlag.SEND_EMAIL_TOOL,
        }),
      ]),
    ).toEqual(['Send emails via connected accounts']);
  });

  it('falls back to generic labels, listed once, for objects and flags the workspace does not have yet', () => {
    expect(
      getLabels([
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.OBJECT_RECORDS,
          action: 'canReadObjectRecords',
          objectUniversalIdentifier: UNKNOWN_UNIVERSAL_IDENTIFIER,
        }),
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.OBJECT_RECORDS,
          action: 'canReadObjectRecords',
          objectUniversalIdentifier: ANOTHER_UNKNOWN_UNIVERSAL_IDENTIFIER,
        }),
        buildGrant({
          type: ApplicationUpgradeRoleGrantType.PERMISSION_FLAG,
          permissionFlagUniversalIdentifier: UNKNOWN_UNIVERSAL_IDENTIFIER,
        }),
      ]),
    ).toEqual([
      'Read records of an object added by this version',
      'Use a permission added by this version',
    ]);
  });
});
