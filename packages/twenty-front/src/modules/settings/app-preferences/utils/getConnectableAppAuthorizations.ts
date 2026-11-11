export const getConnectableAppAuthorizations = <
  TAuthorization extends { oAuthIdentityUniversalIdentifier?: string | null },
>({
  authorizations,
  connectableAppId,
}: {
  authorizations: TAuthorization[];
  connectableAppId: string;
}): TAuthorization[] =>
  authorizations.filter(
    ({ oAuthIdentityUniversalIdentifier }) =>
      oAuthIdentityUniversalIdentifier === connectableAppId,
  );
