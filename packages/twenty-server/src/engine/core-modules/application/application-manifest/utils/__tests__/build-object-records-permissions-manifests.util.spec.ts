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

const DERIVED_IDENTITY = {
  universalIdentifier: 'derived',
  derivedUniversalIdentifier: 'derived',
};

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
            fieldUniversalIdentifier: 'secret',
            rowLevelPermissionRuleUniversalIdentifier: null,
            canReadFieldValue: false,
            canUpdateFieldValue: false,
            ...DERIVED_IDENTITY,
          },
          {
            objectUniversalIdentifier: 'company',
            fieldUniversalIdentifier: 'revenue',
            rowLevelPermissionRuleUniversalIdentifier: 'company-rule',
            canReadFieldValue: null,
            canUpdateFieldValue: false,
            ...DERIVED_IDENTITY,
          },
          {
            objectUniversalIdentifier: 'note',
            fieldUniversalIdentifier: 'body',
            rowLevelPermissionRuleUniversalIdentifier: null,
            canReadFieldValue: false,
            canUpdateFieldValue: null,
            universalIdentifier: 'note-body-permission',
            derivedUniversalIdentifier: 'derived',
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
