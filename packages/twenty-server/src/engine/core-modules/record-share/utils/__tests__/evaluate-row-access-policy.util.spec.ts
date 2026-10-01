/* @license Enterprise */

import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import { FieldMetadataType, RecordShareAccessLevel } from 'twenty-shared/types';

import { type RecordShareGrant } from 'src/engine/core-modules/record-share/types/record-share-grant.type';
import { type RecordSharingRule } from 'src/engine/core-modules/record-share/types/record-sharing-rule.type';
import {
  evaluateRowAccessPolicy,
  type RowAccessEvaluationContext,
} from 'src/engine/core-modules/record-share/utils/evaluate-row-access-policy.util';
import { type RowAccessRecord } from 'src/engine/core-modules/record-share/types/row-access-record.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import {
  type RecordShareExpressionTarget,
  type RowAccessExpression,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

const MEMBER_ID = 'member-1';

const statusField = getFlatFieldMetadataMock({
  objectMetadataId: COMPANY_FLAT_OBJECT_MOCK.id,
  type: FieldMetadataType.TEXT,
  name: 'status',
  universalIdentifier: 'company-status-field-universal-id',
});

const flatObjectMetadata = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  fieldIds: [statusField.id],
};

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: statusField,
  flatEntityMaps:
    createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
});

const shareTarget: RecordShareExpressionTarget = {
  tableAlias: 'company',
  objectMetadataId: flatObjectMetadata.id,
  principalIds: [EVERYONE_PRINCIPAL_ID, MEMBER_ID],
  accessLevels: [
    RecordShareAccessLevel.READ,
    RecordShareAccessLevel.READ_WRITE,
  ],
};

const activeFilter: RowAccessExpression = {
  kind: 'roleFilter',
  tableAlias: 'company',
  flatObjectMetadata,
  recordFilter: { status: { eq: 'active' } },
  condition: { sql: 'TRUE', parameters: {} },
};

const records: RowAccessRecord[] = [
  { id: 'active-shared', status: 'active', deletedAt: null },
  { id: 'active-private', status: 'active', deletedAt: null },
  { id: 'archived-shared', status: 'archived', deletedAt: null },
];

const recordShares: RecordShareGrant[] = [
  {
    recordId: 'active-shared',
    principalId: MEMBER_ID,
    accessLevel: RecordShareAccessLevel.READ,
  },
  {
    recordId: 'archived-shared',
    principalId: MEMBER_ID,
    accessLevel: RecordShareAccessLevel.READ_WRITE,
  },
  {
    recordId: 'active-private',
    principalId: EVERYONE_PRINCIPAL_ID,
    accessLevel: RecordShareAccessLevel.NONE,
  },
];

const buildContext = (
  overrides: Partial<RowAccessEvaluationContext<RowAccessRecord>> = {},
): RowAccessEvaluationContext<RowAccessRecord> => ({
  flatFieldMetadataMaps,
  shouldIgnoreSoftDeleteDefaultFilter: false,
  fetchRecordShares: jest.fn(async ({ recordIds }) =>
    recordShares.filter((recordShare) =>
      recordIds.includes(recordShare.recordId),
    ),
  ),
  executeRawQuery: jest.fn(async () => []),
  resolveRecordIdsReadableThroughParents: jest.fn(
    async () => new Set<string>(),
  ),
  ...overrides,
});

const evaluate = (expression: RowAccessExpression, context = buildContext()) =>
  evaluateRowAccessPolicy({
    policy: { kind: 'gated', expression },
    records,
    context,
  });

describe('evaluateRowAccessPolicy', () => {
  it('admits every record when open and none when denied', async () => {
    const context = buildContext();

    expect(
      await evaluateRowAccessPolicy({
        policy: { kind: 'open' },
        records,
        context,
      }),
    ).toEqual(new Set(records.map((record) => record.id)));
    expect(
      await evaluateRowAccessPolicy({
        policy: { kind: 'denied' },
        records,
        context,
      }),
    ).toEqual(new Set());
  });

  it('matches role filters on the record values', async () => {
    expect(await evaluate(activeFilter)).toEqual(
      new Set(['active-shared', 'active-private']),
    );
  });

  it('admits records shared with the principals', async () => {
    expect(await evaluate({ kind: 'recordShared', ...shareTarget })).toEqual(
      new Set(['active-shared', 'archived-shared']),
    );
  });

  it('keeps out records restricted for everyone', async () => {
    expect(
      await evaluate({ kind: 'recordNotRestricted', ...shareTarget }),
    ).toEqual(new Set(['active-shared', 'archived-shared']));
  });

  it('only fetches shares for records still in play after an and', async () => {
    const context = buildContext();

    expect(
      await evaluate(
        {
          kind: 'and',
          operands: [activeFilter, { kind: 'recordShared', ...shareTarget }],
        },
        context,
      ),
    ).toEqual(new Set(['active-shared']));
    expect(context.fetchRecordShares).toHaveBeenCalledWith({
      objectMetadataId: flatObjectMetadata.id,
      recordIds: ['active-shared', 'active-private'],
    });
  });

  it('admits through either operand of an or, asking later operands only about records not yet admitted', async () => {
    const context = buildContext();

    expect(
      await evaluate(
        {
          kind: 'or',
          operands: [
            {
              kind: 'and',
              operands: [
                activeFilter,
                { kind: 'recordNotRestricted', ...shareTarget },
              ],
            },
            { kind: 'recordShared', ...shareTarget },
          ],
        },
        context,
      ),
    ).toEqual(new Set(['active-shared', 'archived-shared']));
    expect(context.fetchRecordShares).toHaveBeenLastCalledWith({
      objectMetadataId: flatObjectMetadata.id,
      recordIds: ['active-private', 'archived-shared'],
    });
  });

  it('admits the records a sharing rule resolves, querying through the context', async () => {
    const executeRawQuery = jest.fn(async () => [{ id: 'active-private' }]);
    const rule: RecordSharingRule = {
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      principalId: EVERYONE_PRINCIPAL_ID,
      accessLevel: RecordShareAccessLevel.READ,
      buildCondition: () => ({ sql: 'TRUE', parameters: {} }),
      resolveMatchingRecordIds: async ({ records, executeRawQuery }) => {
        const matchingIds = new Set(
          (await executeRawQuery('SELECT "id"', {})).map((row) =>
            String(row.id),
          ),
        );

        return new Set(
          records
            .filter((record) => matchingIds.has(record.id))
            .map((record) => record.id),
        );
      },
    };

    expect(
      await evaluate(
        {
          kind: 'sharingRule',
          tableAlias: 'company',
          workspaceId: 'workspace-id',
          rule,
        },
        buildContext({ executeRawQuery }),
      ),
    ).toEqual(new Set(['active-private']));
    expect(executeRawQuery).toHaveBeenCalledTimes(1);
  });

  it('asks parents only about records not shared directly', async () => {
    const context = buildContext({
      resolveRecordIdsReadableThroughParents: jest.fn(
        async () => new Set(['active-private']),
      ),
    });

    expect(
      await evaluate(
        {
          kind: 'inheritedReadability',
          parents: [],
          isOpenWhenDetached: false,
          ...shareTarget,
        },
        context,
      ),
    ).toEqual(new Set(['active-shared', 'archived-shared', 'active-private']));
    expect(context.resolveRecordIdsReadableThroughParents).toHaveBeenCalledWith(
      expect.objectContaining({
        records: [expect.objectContaining({ id: 'active-private' })],
      }),
    );
  });
});
