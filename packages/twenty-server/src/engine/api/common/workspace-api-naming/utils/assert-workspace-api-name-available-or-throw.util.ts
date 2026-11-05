import { isDefined } from 'twenty-shared/utils';

import { WorkspaceApiNamingException } from 'src/engine/api/common/workspace-api-naming/workspace-api-naming.exception';

export const assertWorkspaceApiNameAvailableOrThrow = ({
  name,
  identity,
  identitiesByName,
}: {
  name: string;
  identity: string;
  identitiesByName: Map<string, string>;
}): void => {
  const existingIdentity = identitiesByName.get(name);

  if (isDefined(existingIdentity) && existingIdentity !== identity) {
    throw new WorkspaceApiNamingException(
      `API name "${name}" is shared by ${existingIdentity} and ${identity}`,
    );
  }

  identitiesByName.set(name, identity);
};
