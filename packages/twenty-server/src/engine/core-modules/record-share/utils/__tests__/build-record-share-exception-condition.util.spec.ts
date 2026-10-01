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

    const { text, values } = compileNamedParameters(sql, parameters);

    expect({
      text: text.replace(
        /recordShare(Restriction|Grant)_[0-9a-f]{10}/g,
        'recordShare$1',
      ),
      values,
    }).toEqual({
      text: 'NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "recordShareRestriction" WHERE "recordShareRestriction"."recordId" = "company"."id" AND "recordShareRestriction"."objectMetadataId" = $1 AND "recordShareRestriction"."principalId" = $2 AND "recordShareRestriction"."accessLevel" IN ($3, $4) AND "recordShareRestriction"."deletedAt" IS NULL AND NOT EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "recordShareGrant" WHERE "recordShareGrant"."recordId" = "recordShareRestriction"."recordId" AND "recordShareGrant"."objectMetadataId" = $1 AND "recordShareGrant"."principalId" = ANY($5) AND "recordShareGrant"."accessLevel" IN ($6, $7) AND "recordShareGrant"."deletedAt" IS NULL))',
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

  it('should keep its aliases apart whatever the length of the table alias', () => {
    const { sql } = buildRecordShareExceptionCondition({
      tableAlias: 'a'.repeat(80),
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: OBJECT_METADATA_ID,
      principalIds: PRINCIPAL_IDS,
      accessLevels: [RecordShareAccessLevel.FULL],
    });

    const aliases = [...sql.matchAll(/ AS "([^"]+)"/g)].map(([, alias]) =>
      Buffer.from(alias).subarray(0, 63).toString(),
    );

    expect(aliases).toHaveLength(2);
    expect(new Set(aliases).size).toBe(2);
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
