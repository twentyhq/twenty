import { isNonEmptyString } from '@sniptt/guards';
import { UnipileScopes } from '@unipile/sdk';
import { kv } from 'twenty-sdk/logic-function';
import { isDefined } from 'twenty-sdk/utils';

const UNIPILE_WORKSPACE_SCOPE_ID_KEY = 'unipile-workspace-scope-id';

type UnipileServiceRequestOptions = { auth: string; throwOnError: true };

const findUnipileScopeIdByReference = async ({
  reference,
  requestOptions,
}: {
  reference: string;
  requestOptions: UnipileServiceRequestOptions;
}): Promise<string | undefined> => {
  const { data } = await new UnipileScopes().listScopes({
    ...requestOptions,
    query: { search: reference },
  });

  return data.data.find((scope) => scope.reference === reference)?.id;
};

const createUnipileWorkspaceScope = async ({
  workspaceId,
  requestOptions,
}: {
  workspaceId: string;
  requestOptions: UnipileServiceRequestOptions;
}): Promise<string> => {
  try {
    const { data } = await new UnipileScopes().createScope({
      ...requestOptions,
      body: { name: `Twenty workspace ${workspaceId}`, reference: workspaceId },
    });

    return data.id;
  } catch (error) {
    // The reference is unique per Unipile application, so a concurrent connection may have created it first
    const scopeId = await findUnipileScopeIdByReference({
      reference: workspaceId,
      requestOptions,
    });

    if (isDefined(scopeId)) {
      return scopeId;
    }

    throw error;
  }
};

// Unipile refuses a provider account already linked in the same Scope, so each workspace links accounts in its own Scope
// Only a Service key manages Scopes: without one, accounts stay unscoped as before
export const getOrCreateUnipileWorkspaceScopeId = async (
  workspaceId: string,
): Promise<string | undefined> => {
  const serviceApiKey = process.env.UNIPILE_SERVICE_API_KEY;

  if (!isNonEmptyString(serviceApiKey)) {
    return undefined;
  }

  const cachedScopeId = await kv.get<string>(UNIPILE_WORKSPACE_SCOPE_ID_KEY);

  if (isNonEmptyString(cachedScopeId)) {
    return cachedScopeId;
  }

  const requestOptions = { auth: serviceApiKey, throwOnError: true as const };
  const scopeId =
    (await findUnipileScopeIdByReference({
      reference: workspaceId,
      requestOptions,
    })) ?? (await createUnipileWorkspaceScope({ workspaceId, requestOptions }));

  await kv.set(UNIPILE_WORKSPACE_SCOPE_ID_KEY, scopeId);

  return scopeId;
};
