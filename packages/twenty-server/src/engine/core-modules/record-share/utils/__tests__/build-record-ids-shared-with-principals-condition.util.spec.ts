/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { buildRecordIdsSharedWithPrincipalsCondition } from 'src/engine/core-modules/record-share/utils/build-record-ids-shared-with-principals-condition.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

describe('buildRecordIdsSharedWithPrincipalsCondition', () => {
  it('should match the record id against the grants read once, not per row', () => {
    const { sql, parameters } = buildRecordIdsSharedWithPrincipalsCondition({
      tableAlias: 'company',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: 'object-metadata-1',
      principalIds: ['principal-1'],
      accessLevels: [RecordShareAccessLevel.READ, RecordShareAccessLevel.FULL],
    });

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: '"company"."id" = ANY(ARRAY(SELECT "company_namedGrant"."recordId" FROM "workspace_abc"."recordShare" AS "company_namedGrant" WHERE "company_namedGrant"."objectMetadataId" = $1 AND "company_namedGrant"."principalId" = ANY($2) AND "company_namedGrant"."accessLevel" IN ($3, $4) AND "company_namedGrant"."deletedAt" IS NULL))',
      values: [
        'object-metadata-1',
        ['principal-1'],
        RecordShareAccessLevel.READ,
        RecordShareAccessLevel.FULL,
      ],
    });
  });
});
