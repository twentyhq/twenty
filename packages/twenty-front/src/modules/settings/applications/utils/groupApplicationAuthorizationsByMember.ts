import { type ApplicationAuthorization } from '~/generated-metadata/graphql';

export const groupApplicationAuthorizationsByMember = <
  TAuthorization extends Pick<ApplicationAuthorization, 'userId'>,
>(
  authorizations: TAuthorization[],
): TAuthorization[][] => {
  const authorizationsByUserId = new Map<string, TAuthorization[]>();

  for (const authorization of authorizations) {
    authorizationsByUserId.set(authorization.userId, [
      ...(authorizationsByUserId.get(authorization.userId) ?? []),
      authorization,
    ]);
  }

  return [...authorizationsByUserId.values()];
};
