import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';

import { resolveShareWithPrincipal } from 'src/engine/api/common/common-query-runners/common-create-many-query-runner/utils/resolve-share-with-principal.util';
import { type ShareWithInput } from 'src/engine/api/common/types/share-with-input.type';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordShareInput } from 'src/engine/record-share/types/record-share-input.type';

const resolveShareWithRowOrigin = ({
  authContext,
  recordId,
}: {
  authContext: WorkspaceAuthContext;
  recordId: string;
}): Pick<RecordShareInput, 'rowCause' | 'sourceId'> => {
  if (isUserAuthContext(authContext)) {
    return {
      rowCause: RecordShareRowCause.MANUAL,
      sourceId: authContext.workspaceMemberId,
    };
  }

  if (isApplicationAuthContext(authContext)) {
    return {
      rowCause: RecordShareRowCause.APPLICATION,
      sourceId: authContext.application.id,
    };
  }

  return { rowCause: RecordShareRowCause.MANUAL, sourceId: recordId };
};

export const buildRecordShareInputsForCreatedRecords = ({
  recordIds,
  objectMetadataId,
  authContext,
  shareWith = [],
}: {
  recordIds: string[];
  objectMetadataId: string;
  authContext: WorkspaceAuthContext;
  shareWith?: ShareWithInput[];
}): RecordShareInput[] => {
  const shareWithPrincipals = shareWith.map(resolveShareWithPrincipal);

  return recordIds.flatMap((recordId) => [
    ...(isUserAuthContext(authContext)
      ? [
          {
            recordId,
            objectMetadataId,
            principalId: authContext.workspaceMemberId,
            principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
            accessLevel: RecordShareAccessLevel.FULL,
            rowCause: RecordShareRowCause.OWNER,
            sourceId: recordId,
          },
        ]
      : []),
    ...shareWithPrincipals.map((shareWithPrincipal) => ({
      recordId,
      objectMetadataId,
      ...shareWithPrincipal,
      ...resolveShareWithRowOrigin({ authContext, recordId }),
    })),
  ]);
};
