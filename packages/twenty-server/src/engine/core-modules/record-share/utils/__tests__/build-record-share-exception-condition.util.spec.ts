/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { RecordShareAccessLevel } from 'twenty-shared/types';

import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';
import { buildRecordShareExceptionCondition } from 'src/engine/core-modules/record-share/utils/build-record-share-exception-condition.util';

const OBJECT_METADATA_ID = 'object-metadata-1';
const PRINCIPAL_IDS = ['principal-1', EVERYONE_PRINCIPAL_ID];

const build = (accessLevels: RecordShareAccessLevel[]) =>
  buildRecordShareExceptionCondition({
    tableAlias: 'company',
    recordShareTableExpression: '"workspace_abc"."recordShare"',
    objectMetadataId: OBJECT_METADATA_ID,
    principalIds: PRINCIPAL_IDS,
    accessLevels,
  });

describe('buildRecordShareExceptionCondition', () => {
  it('should render a single NOT EXISTS on restrictions not lifted by a grant', () => {
    const { sql, parameters } = build([
      RecordShareAccessLevel.READ_WRITE,
      RecordShareAccessLevel.FULL,
    ]);

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: 'NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "company_recordShareRestriction" WHERE "company_recordShareRestriction"."recordId" = "company"."id" AND "company_recordShareRestriction"."objectMetadataId" = $1 AND "company_recordShareRestriction"."principalId" = $2 AND "company_recordShareRestriction"."accessLevel" IN ($3, $4) AND "company_recordShareRestriction"."deletedAt" IS NULL AND NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "company_recordShareGrant" WHERE "company_recordShareGrant"."recordId" = "company_recordShareRestriction"."recordId" AND "company_recordShareGrant"."objectMetadataId" = $1 AND "company_recordShareGrant"."principalId" = ANY($5) AND "company_recordShareGrant"."accessLevel" IN ($6, $7) AND "company_recordShareGrant"."deletedAt" IS NULL))',
      values: [
        OBJECT_METADATA_ID,
        EVERYONE_PRINCIPAL_ID,
        RecordShareAccessLevel.NONE,
        RecordShareAccessLevel.READ,
        PRINCIPAL_IDS,
        RecordShareAccessLevel.READ_WRITE,
        RecordShareAccessLevel.FULL,
      ],
    });
  });

  it('should only treat levels below the required ones as restrictions', () => {
    const { parameters } = build([
      RecordShareAccessLevel.READ,
      RecordShareAccessLevel.READ_WRITE,
      RecordShareAccessLevel.FULL,
    ]);

    const restrictedAccessLevels = Object.entries(parameters).find(([name]) =>
      name.startsWith('recordShareExceptionRestrictedAccessLevels_'),
    )?.[1];

    expect(restrictedAccessLevels).toEqual([RecordShareAccessLevel.NONE]);
  });

  it('should not reuse parameter names between two conditions', () => {
    const first = Object.keys(build([RecordShareAccessLevel.FULL]).parameters);
    const second = Object.keys(build([RecordShareAccessLevel.FULL]).parameters);

    expect(first.filter((name) => second.includes(name))).toEqual([]);
  });
});
