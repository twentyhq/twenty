import { isNonEmptyString } from '@sniptt/guards';
import { UnipileScopes } from '@unipile/sdk';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

import { getUnipileRequestOptions } from 'src/unipile/utils/get-unipile-request-options.util';

const UNIPILE_WORKSPACE_SCOPE_ID_KEY = 'unipile-workspace-scope-id';

const findUnipileScopeIdByReference = async (
  reference: string,
): Promise<string | undefined> => {
  const { data } = await new UnipileScopes().listScopes({
    ...getUnipileRequestOptions(),
    query: { search: reference },
  });

  return data.data.find((scope) => scope.reference === reference)?.id;
};

const createUnipileWorkspaceScope = async (
  workspaceId: string,
): Promise<string> => {
  try {
    const { data } = await new UnipileScopes().createScope({
      ...getUnipileRequestOptions(),
      body: { name: `Twenty workspace ${workspaceId}`, reference: workspaceId },
    });

    return data.id;
  } catch (error) {
    // The reference is unique per Unipile application, so a concurrent connection may have created it first
    const scopeId = await findUnipileScopeIdByReference(workspaceId);

    if (isDefined(scopeId)) {
      return scopeId;
    }

    throw error;
  }
};

// Unipile refuses a provider account already linked in the same Scope, so each workspace links accounts in its own Scope
export const getOrCreateUnipileWorkspaceScopeId = async (
  workspaceId: string,
): Promise<string> => {
  const cachedScopeId = await kv.get<string>(UNIPILE_WORKSPACE_SCOPE_ID_KEY);

  if (isNonEmptyString(cachedScopeId)) {
    return cachedScopeId;
  }

  const scopeId =
    (await findUnipileScopeIdByReference(workspaceId)) ??
    (await createUnipileWorkspaceScope(workspaceId));

  await kv.set(UNIPILE_WORKSPACE_SCOPE_ID_KEY, scopeId);

  return scopeId;
};
