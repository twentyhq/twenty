/* @license Enterprise */

import { RecordShareAccessLevel } from 'twenty-shared/types';

import { buildParentRecordShareCondition } from 'src/engine/core-modules/record-share/utils/build-parent-record-share-condition.util';
import { compileNamedParameters } from 'src/engine/twenty-orm/sql/utils/compile-named-parameters.util';

describe('buildParentRecordShareCondition', () => {
  it('should admit a record without parent or with a share on the parent its join column points to', () => {
    const { sql, parameters } = buildParentRecordShareCondition({
      tableAlias: 'agentChatThreadTarget',
      joinColumnName: 'threadId',
      recordShareTableExpression: '"workspace_abc"."recordShare"',
      objectMetadataId: 'thread-object-id',
      principalIds: ['member-1'],
      accessLevels: [RecordShareAccessLevel.FULL],
    });

    expect(compileNamedParameters(sql, parameters)).toEqual({
      text: '("agentChatThreadTarget"."threadId" IS NULL OR EXISTS (SELECT 1 FROM "workspace_abc"."recordShare" AS "agentChatThreadTarget_recordShare" WHERE "agentChatThreadTarget_recordShare"."recordId" = "agentChatThreadTarget"."threadId" AND "agentChatThreadTarget_recordShare"."objectMetadataId" = $1 AND "agentChatThreadTarget_recordShare"."principalId" = ANY($2) AND "agentChatThreadTarget_recordShare"."accessLevel" IN ($3) AND "agentChatThreadTarget_recordShare"."deletedAt" IS NULL))',
      values: ['thread-object-id', ['member-1'], RecordShareAccessLevel.FULL],
    });
  });
});
