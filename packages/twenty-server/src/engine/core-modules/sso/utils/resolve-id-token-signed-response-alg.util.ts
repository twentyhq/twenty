/* @license Enterprise */

// openid-client's `IssuerMetadata` type doesn't declare this field explicitly
// (it falls through the `[key: string]: unknown` index signature), even
// though `id_token_signing_alg_values_supported` is standard OIDC discovery
// metadata (https://openid.net/specs/openid-connect-discovery-1_0.html).
// The index signature here mirrors `IssuerMetadata`'s own so this type
// stays structurally assignable from it.
type IssuerMetadataWithSigningAlgs = {
  id_token_signing_alg_values_supported?: unknown;
  [key: string]: unknown;
};

/**
 * Picks which `id_token_signed_response_alg` to register the OIDC client
 * with, based on what the identity provider actually advertises.
 *
 * If we don't pass this explicitly, openid-client's `Client` constructor
 * silently defaults it to 'RS256' regardless of what the issuer supports
 * (this is a spec-mandated default, not something the library infers from
 * discovery). Identity providers that sign id_tokens with anything else
 * (Logto's ES384 default, for example) then fail every login with
 * "unexpected JWT alg received", even though the algorithm they used is one
 * they published support for.
 *
 * Returns undefined when the issuer didn't publish a usable list, in which
 * case we fall back to leaving `id_token_signed_response_alg` unset (i.e.
 * openid-client's own RS256 default), preserving today's behavior.
 */
export const resolveIdTokenSignedResponseAlg = (
  issuerMetadata: IssuerMetadataWithSigningAlgs,
): string | undefined => {
  const supportedAlgs = issuerMetadata.id_token_signing_alg_values_supported;

  if (!Array.isArray(supportedAlgs)) {
    return undefined;
  }

  const stringAlgs = supportedAlgs.filter(
    (alg): alg is string => typeof alg === 'string' && alg.length > 0,
  );

  if (stringAlgs.length === 0) {
    return undefined;
  }

  return stringAlgs.includes('RS256') ? 'RS256' : stringAlgs[0];
};
