import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
  RecordShareRowCause,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isApiKeyAuthContext } from 'src/engine/core-modules/auth/guards/is-api-key-auth-context.guard';
import { isApplicationAuthContext } from 'src/engine/core-modules/auth/guards/is-application-auth-context.guard';
import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type RecordShareInput } from 'src/engine/core-modules/record-share/types/record-share-input.type';
import { type ShareWithInput } from 'src/engine/core-modules/record-share/types/share-with-input.type';
import { resolveShareWithPrincipalOrThrow } from 'src/engine/core-modules/record-share/utils/resolve-share-with-principal-or-throw.util';

type RecordShareInputForRecord = Omit<
  RecordShareInput,
  'recordId' | 'objectMetadataId'
>;

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

const resolveCreatorRoleId = ({
  authContext,
  apiKeyRoleMap,
}: {
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
}): string | null | undefined => {
  if (isApplicationAuthContext(authContext)) {
    return authContext.application.defaultRoleId;
  }

  if (isApiKeyAuthContext(authContext)) {
    return apiKeyRoleMap[authContext.apiKey.id];
  }

  return undefined;
};

const buildCreatorRows = ({
  authContext,
  apiKeyRoleMap,
  recordId,
  shareWithPrincipals,
}: {
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
  recordId: string;
  shareWithPrincipals: Pick<RecordShareInput, 'principalId'>[];
}): RecordShareInputForRecord[] => {
  if (isUserAuthContext(authContext)) {
    return [
      {
        principalId: authContext.workspaceMemberId,
        principalType: RecordSharePrincipalType.WORKSPACE_MEMBER,
        accessLevel: RecordShareAccessLevel.FULL,
        rowCause: RecordShareRowCause.OWNER,
        sourceId: recordId,
      },
    ];
  }

  const creatorRoleId = resolveCreatorRoleId({ authContext, apiKeyRoleMap });

  if (
    !isDefined(creatorRoleId) ||
    shareWithPrincipals.some(
      (shareWithPrincipal) => shareWithPrincipal.principalId === creatorRoleId,
    )
  ) {
    return [];
  }

  return [
    {
      principalId: creatorRoleId,
      principalType: RecordSharePrincipalType.ROLE,
      accessLevel: RecordShareAccessLevel.FULL,
      ...resolveShareWithRowOrigin({ authContext, recordId }),
    },
  ];
};

export const buildRecordShareInputsForCreatedRecords = ({
  recordIds,
  objectMetadataId,
  authContext,
  apiKeyRoleMap,
  shareWith,
  isRecordSharingEnforced = true,
}: {
  recordIds: string[];
  objectMetadataId: string;
  authContext: WorkspaceAuthContext;
  apiKeyRoleMap: Record<string, string>;
  shareWith?: ShareWithInput[] | null;
  isRecordSharingEnforced?: boolean;
}): RecordShareInput[] => {
  const shareWithEntries = shareWith ?? [];
  const creatorRoleId = resolveCreatorRoleId({ authContext, apiKeyRoleMap });
  const shareWithPrincipals = shareWithEntries
    .map(resolveShareWithPrincipalOrThrow)
    .map((shareWithPrincipal) =>
      shareWithPrincipal.principalId === creatorRoleId
        ? { ...shareWithPrincipal, accessLevel: RecordShareAccessLevel.FULL }
        : shareWithPrincipal,
    );

  return [
    ...recordIds.flatMap((recordId) => [
      ...(!isRecordSharingEnforced && shareWithEntries.length === 0
        ? [
            {
              recordId,
              objectMetadataId,
              principalId: EVERYONE_PRINCIPAL_ID,
              principalType: RecordSharePrincipalType.EVERYONE,
              accessLevel: RecordShareAccessLevel.FULL,
              rowCause: RecordShareRowCause.APPLICATION,
              sourceId: objectMetadataId,
            },
          ]
        : []),
      ...buildCreatorRows({
        authContext,
        apiKeyRoleMap,
        recordId,
        shareWithPrincipals,
      }).map((creatorRow) => ({ recordId, objectMetadataId, ...creatorRow })),
      ...shareWithPrincipals.map((shareWithPrincipal) => ({
        recordId,
        objectMetadataId,
        ...shareWithPrincipal,
        ...resolveShareWithRowOrigin({ authContext, recordId }),
      })),
    ]),
  ];
};
