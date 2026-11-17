import { getFieldPermissionUniversalIdentifier } from 'twenty-shared/application';
import { RowLevelPermissionPredicateOperand } from 'twenty-shared/types';

import { buildObjectRecordsPermissionsManifests } from 'src/engine/core-modules/application/application-manifest/utils/build-object-records-permissions-manifests.util';

const buildRule = ({
  universalIdentifier,
  objectUniversalIdentifier,
}: {
  universalIdentifier: string;
  objectUniversalIdentifier: string;
}) => ({
  universalIdentifier,
  objectUniversalIdentifier,
  canReadRecords: true,
  predicates: [
    {
      universalIdentifier: `${universalIdentifier}-predicate`,
      fieldUniversalIdentifier: 'field',
      operand: RowLevelPermissionPredicateOperand.IS,
    },
  ],
});

const OWNER = {
  applicationUniversalIdentifier: '20202020-0000-4000-8000-000000000001',
  roleUniversalIdentifier: 'role',
};

const withDerivedIdentifier = (fieldUniversalIdentifier: string) => ({
  ...OWNER,
  fieldUniversalIdentifier,
  universalIdentifier: getFieldPermissionUniversalIdentifier({
    ...OWNER,
    fieldUniversalIdentifier,
  }),
});

describe('buildObjectRecordsPermissionsManifests', () => {
  it('should gather the all records permissions, field restrictions and rules of each object, add an entry for an object without all records permissions, and name a field permission whose identifier is not derived', () => {
    const companyRule = buildRule({
      universalIdentifier: 'company-rule',
      objectUniversalIdentifier: 'company',
    });
    const personRule = buildRule({
      universalIdentifier: 'person-rule',
      objectUniversalIdentifier: 'person',
    });
    const { objectUniversalIdentifier: _company, ...nestedCompanyRule } =
      companyRule;
    const { objectUniversalIdentifier: _person, ...nestedPersonRule } =
      personRule;

    expect(
      buildObjectRecordsPermissionsManifests({
        allRecordsPermissions: [
          { objectUniversalIdentifier: 'company', canReadAllRecords: false },
          { objectUniversalIdentifier: 'task', canReadAllRecords: true },
        ],
        rowLevelPermissionRules: [companyRule, personRule],
        fieldRestrictions: [
          {
            objectUniversalIdentifier: 'task',
            ...withDerivedIdentifier('secret'),
            rowLevelPermissionRuleUniversalIdentifier: null,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
          {
            objectUniversalIdentifier: 'company',
            ...withDerivedIdentifier('revenue'),
            rowLevelPermissionRuleUniversalIdentifier: 'company-rule',
            canReadFieldValue: null,
            canUpdateFieldValue: false,
          },
          {
            objectUniversalIdentifier: 'note',
            fieldUniversalIdentifier: 'body',
            rowLevelPermissionRuleUniversalIdentifier: null,
            canReadFieldValue: false,
            canUpdateFieldValue: null,
            ...OWNER,
            universalIdentifier: 'note-body-permission',
          },
        ],
      }),
    ).toEqual([
      {
        objectUniversalIdentifier: 'company',
        canReadAllRecords: false,
        rowLevelRecordsPermissions: [
          { ...nestedCompanyRule, uneditableFields: ['revenue'] },
        ],
      },
      {
        objectUniversalIdentifier: 'task',
        canReadAllRecords: true,
        unreadableFields: ['secret'],
        uneditableFields: ['secret'],
      },
      {
        objectUniversalIdentifier: 'person',
        rowLevelRecordsPermissions: [nestedPersonRule],
      },
      {
        objectUniversalIdentifier: 'note',
        unreadableFields: ['body'],
        fieldPermissionIdentifiers: [
          {
            fieldUniversalIdentifier: 'body',
            universalIdentifier: 'note-body-permission',
          },
        ],
      },
    ]);
  });
});
