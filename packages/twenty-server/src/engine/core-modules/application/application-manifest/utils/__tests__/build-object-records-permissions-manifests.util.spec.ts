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

describe('buildObjectRecordsPermissionsManifests', () => {
  it('should nest the rules of an object under its all records permissions, and add an entry for an object that only has rules', () => {
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
      }),
    ).toEqual([
      {
        objectUniversalIdentifier: 'company',
        canReadAllRecords: false,
        rowLevelRecordsPermissions: [nestedCompanyRule],
      },
      { objectUniversalIdentifier: 'task', canReadAllRecords: true },
      {
        objectUniversalIdentifier: 'person',
        rowLevelRecordsPermissions: [nestedPersonRule],
      },
    ]);
  });
});
