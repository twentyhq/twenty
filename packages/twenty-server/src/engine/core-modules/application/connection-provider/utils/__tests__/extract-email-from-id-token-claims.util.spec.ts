import * as jwt from 'jsonwebtoken';

import { extractEmailFromIdTokenClaims } from 'src/engine/core-modules/application/connection-provider/utils/extract-email-from-id-token-claims.util';

// Claim sets below follow the sample id_token payloads published by each
// provider's OIDC documentation, kept close to verbatim so the claim names,
// the namespaced keys and the string-vs-boolean quirks stay realistic.
const GOOGLE_CLAIMS = {
  iss: 'https://accounts.google.com',
  azp: '1234987819200.apps.googleusercontent.com',
  aud: '1234987819200.apps.googleusercontent.com',
  sub: '10769150350006150715113082367',
  at_hash: 'HK6E_P6Dh8Y93mRNtsDB1Q',
  hd: 'example.com',
  email: 'jsmith@example.com',
  email_verified: 'true',
  iat: 1353601026,
  exp: 1353604926,
  nonce: '0394852-3190485-2490358',
};

const MICROSOFT_ENTRA_ID_V1_CLAIMS = {
  ver: '1.0',
  iss: 'https://sts.windows.net/72f988bf-86f1-41af-91ab-2d7cd011db47/',
  sub: 'HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ',
  aud: '6e74172b-be56-4843-9ff4-e66a39bb12e3',
  tid: '72f988bf-86f1-41af-91ab-2d7cd011db47',
  oid: '690222be-ff1a-4d56-abd1-7e4f7d38e474',
  name: 'Abe Lincoln',
  upn: 'abeli@microsoft.com',
  unique_name: 'abeli@microsoft.com',
  iat: 1537231048,
  nbf: 1537231048,
  exp: 1537234948,
};

const MICROSOFT_ENTRA_ID_V2_CLAIMS = {
  ver: '2.0',
  iss: 'https://login.microsoftonline.com/9122040d-6c67-4c5b-b112-36a304b66dad/v2.0',
  sub: 'AAAAAAAAAAAAAAAAAAAAAIkzqFVrSaSaFHy782bbtaQ',
  aud: '6cb04018-a3f5-46a7-b995-940c78f5aef3',
  exp: 1536361411,
  iat: 1536274711,
  nbf: 1536274711,
  name: 'Abe Lincoln',
  preferred_username: 'AbeLi@microsoft.com',
  oid: '00000000-0000-0000-66f3-3332eca7ea81',
  tid: '9122040d-6c67-4c5b-b112-36a304b66dad',
  nonce: '123523',
  aio: 'Df2UVXL1ix!lMCWMSOJBcFatzcGfvFGhjKv8q5g0x732dR5MB5BisvGQO7YWByjd8iQ',
};

const SLACK_CLAIMS = {
  iss: 'https://slack.com',
  sub: 'U0R7JM',
  aud: '25259531569.1115853',
  exp: 1608130305,
  iat: 1608139305,
  auth_time: 1608139305,
  nonce: 'abcd',
  at_hash: 'TgAT4G8Y1FYjTUuFqNMjPQ',
  'https://slack.com/team_id': 'T0RR',
  'https://slack.com/user_id': 'U0RR',
  email: 'bront@slack-corp.com',
  email_verified: true,
  date_email_verified: 1622128723,
  locale: 'en-US',
  name: 'Brontosaurus',
  given_name: 'Bront',
  family_name: 'Saurus',
  'https://slack.com/team_name': 'kraneflannel',
  'https://slack.com/team_domain': 'kraneflannel',
  'https://slack.com/team_image_default': true,
};

const OKTA_CLAIMS = {
  sub: '00uid4BxXw6I6TV4m0g3',
  name: 'John Doe',
  nickname: 'Jimmy',
  given_name: 'John',
  family_name: 'Doe',
  zoneinfo: 'America/Los_Angeles',
  locale: 'en-US',
  updated_at: 1311280970,
  email: 'john.doe@example.com',
  email_verified: true,
  preferred_username: 'john.doe@example.com',
  iss: 'https://acme.okta.com',
  aud: 'uAaunofWkaDJxukCFeBx',
  iat: 1449624026,
  exp: 1449627626,
  amr: ['pwd'],
  jti: 'ID.4eKxCnPixgBAXWLBjbcbtqi.HkiCS-49m78pRUyEsPU',
  auth_time: 1449624026,
  at_hash: 'cpqKfdQA5eH891Ff5oJr_Q',
};

const AUTH0_CLAIMS = {
  iss: 'https://acme.eu.auth0.com/',
  sub: 'auth0|5f7c8ec7c33c6c004bbafe82',
  aud: 'tOKV9LtLnTn7XyGuLQ8HgPRJHUlKf2Ff',
  exp: 1311281970,
  iat: 1311280970,
  name: 'Jane Doe',
  given_name: 'Jane',
  family_name: 'Doe',
  nickname: 'janedoe',
  email: 'janedoe@example.com',
  email_verified: true,
  picture: 'https://example.com/janedoe/me.jpg',
  updated_at: '2023-01-20T09:00:00.000Z',
};

const APPLE_CLAIMS = {
  iss: 'https://appleid.apple.com',
  aud: 'com.example.app',
  exp: 1601165021,
  iat: 1601164421,
  sub: '001234.567abc890def1234567abc890def12.3456',
  at_hash: 'aB1cD2eF3gH4iJ5kL6mN7o',
  email: 'q7v9rk2xnp@privaterelay.appleid.com',
  email_verified: 'true',
  is_private_email: 'true',
  auth_time: 1601164421,
  nonce_supported: true,
};

const SALESFORCE_CLAIMS = {
  at_hash: 'qzn9lD2sKUOl0J2NjK-CoQ',
  sub: 'https://login.salesforce.com/id/00Dx0000000BV7z/005x00000012Q9P',
  aud: '3MVG9lKcPoNINVBIPJjdw1J9LLM82HnFVVX19KY1uA5mu0QqEWhqKpoW3svG3XHrX',
  iss: 'https://login.salesforce.com',
  exp: 1391471505,
  iat: 1391469705,
  email: 'pat.patterson@example.com',
  email_verified: true,
  preferred_username: 'pat.patterson@example.com',
  given_name: 'Pat',
  family_name: 'Patterson',
  name: 'Pat Patterson',
  zoneinfo: 'America/Los_Angeles',
};

const LINKEDIN_CLAIMS = {
  iss: 'https://www.linkedin.com/oauth',
  aud: '86ce4dqxvxxxxx',
  iat: 1685475601,
  exp: 1685479201,
  sub: '782bbtaQ',
  name: 'John Doe',
  given_name: 'John',
  family_name: 'Doe',
  picture:
    'https://media.licdn.com/dms/image/C5603AQHOfjxvMWo4Fw/0/1516266527329',
  email: 'doe@email.com',
  email_verified: true,
  locale: 'en-US',
};

const ATLASSIAN_CLAIMS = {
  iss: 'https://atlassian-account-prod.pus2.auth0.com/',
  sub: '557058:f0d38f1a-1ae2-4c9d-a6f4-a5c5a5e00d90',
  aud: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ123456',
  exp: 1735689600,
  iat: 1735686000,
  name: 'Mia Krystof',
  email: 'mia.krystof@example.com',
  email_verified: true,
  picture:
    'https://avatar-management--avatars.us-west-2.prod.public.atl-paas.net/557058/avatar.png',
};

// GitLab, like most self-serve providers, ships a username in
// `preferred_username` alongside the real address in `email`.
const GITLAB_CLAIMS = {
  iss: 'https://gitlab.com',
  sub: '1234567',
  aud: 'aBcDeFgHiJkLmNoPqRsTuVwXyZ',
  exp: 1735689600,
  iat: 1735686000,
  auth_time: 1735686000,
  name: 'Jane Doe',
  nickname: 'janedoe',
  preferred_username: 'janedoe',
  email: 'jane.doe@example.com',
  email_verified: true,
  profile: 'https://gitlab.com/janedoe',
  groups_direct: ['acme/backend'],
};

const ZOOM_CLAIMS = {
  iss: 'https://zoom.us',
  sub: 'z8dsdaqRTOKb3S5ZDaVAbA',
  aud: 'H2jZQmGiQeaC8ZSHTHTaFg',
  exp: 1735689600,
  iat: 1735686000,
  auth_time: 1735686000,
  name: 'Jill Chill',
  email: 'jchill@example.com',
  email_verified: true,
};

// Twitch only adds `email` when the app asks for it through the `claims`
// authorization parameter, and its `preferred_username` is the channel name.
const TWITCH_CLAIMS_WITHOUT_EMAIL = {
  iss: 'https://id.twitch.tv/oauth2',
  sub: '141981764',
  aud: 'q6batx0epp608isickayubi39itsckt',
  azp: 'q6batx0epp608isickayubi39itsckt',
  exp: 1748365982,
  iat: 1748364982,
  preferred_username: 'dallas',
};

// A Keycloak realm that granted `profile` but not the `email` scope.
const KEYCLOAK_CLAIMS_WITHOUT_EMAIL_SCOPE = {
  exp: 1735689600,
  iat: 1735686000,
  auth_time: 1735686000,
  jti: 'a4c3e0b1-1f9a-4b64-8c8e-9d64a4a9e3d1',
  iss: 'https://keycloak.example.com/realms/twenty',
  aud: 'twenty-app',
  sub: 'f:2c4b8d1e-0f7a-4f0b-9a05-1b8f0b9a5d3c:jdoe',
  typ: 'ID',
  azp: 'twenty-app',
  sid: '0a1b2c3d-4e5f-6789-abcd-ef0123456789',
  acr: '1',
  preferred_username: 'jdoe',
  name: 'John Doe',
};

const MINIMAL_OIDC_CLAIMS = {
  iss: 'https://server.example.com',
  sub: '24400320',
  aud: 's6BhdRkqt3',
  nonce: 'n-0S6_WzA2Mj',
  exp: 1311281970,
  iat: 1311280970,
};

const buildIdToken = (claims: object): string =>
  jwt.sign(claims, 'test-secret', { noTimestamp: true });

describe('extractEmailFromIdTokenClaims', () => {
  it.each([
    ['Google', GOOGLE_CLAIMS, 'jsmith@example.com'],
    [
      'Microsoft Entra ID v1.0',
      MICROSOFT_ENTRA_ID_V1_CLAIMS,
      'abeli@microsoft.com',
    ],
    [
      'Microsoft Entra ID v2.0',
      MICROSOFT_ENTRA_ID_V2_CLAIMS,
      'AbeLi@microsoft.com',
    ],
    ['Slack', SLACK_CLAIMS, 'bront@slack-corp.com'],
    ['Okta', OKTA_CLAIMS, 'john.doe@example.com'],
    ['Auth0', AUTH0_CLAIMS, 'janedoe@example.com'],
    ['Apple', APPLE_CLAIMS, 'q7v9rk2xnp@privaterelay.appleid.com'],
    ['Salesforce', SALESFORCE_CLAIMS, 'pat.patterson@example.com'],
    ['LinkedIn', LINKEDIN_CLAIMS, 'doe@email.com'],
    ['Atlassian', ATLASSIAN_CLAIMS, 'mia.krystof@example.com'],
    ['GitLab', GITLAB_CLAIMS, 'jane.doe@example.com'],
    ['Zoom', ZOOM_CLAIMS, 'jchill@example.com'],
  ])('extracts the account email from a %s id_token', (_, claims, expected) => {
    expect(extractEmailFromIdTokenClaims(buildIdToken(claims))).toBe(expected);
  });

  it.each([
    ['Twitch with no email claim requested', TWITCH_CLAIMS_WITHOUT_EMAIL],
    ['Keycloak without the email scope', KEYCLOAK_CLAIMS_WITHOUT_EMAIL_SCOPE],
    ['a spec-minimal id_token', MINIMAL_OIDC_CLAIMS],
  ])('returns null for %s', (_, claims) => {
    expect(extractEmailFromIdTokenClaims(buildIdToken(claims))).toBeNull();
  });

  it('prefers the email claim over upn and preferred_username', () => {
    const idToken = buildIdToken({
      ...MICROSOFT_ENTRA_ID_V1_CLAIMS,
      email: 'abeli-mailbox@microsoft.com',
      preferred_username: 'abeli-alias@microsoft.com',
    });

    expect(extractEmailFromIdTokenClaims(idToken)).toBe(
      'abeli-mailbox@microsoft.com',
    );
  });

  it('prefers the upn claim over preferred_username when there is no email claim', () => {
    const idToken = buildIdToken({
      ...MICROSOFT_ENTRA_ID_V1_CLAIMS,
      preferred_username: 'abeli-alias@microsoft.com',
    });

    expect(extractEmailFromIdTokenClaims(idToken)).toBe('abeli@microsoft.com');
  });

  it('trims surrounding whitespace', () => {
    const idToken = buildIdToken({ email: '  jsmith@example.com  ' });

    expect(extractEmailFromIdTokenClaims(idToken)).toBe('jsmith@example.com');
  });

  it.each([
    ['a non-string email claim', { email: 42 }],
    ['a structured email claim', { email: { address: 'jsmith@example.com' } }],
    ['an empty email claim', { email: '' }],
    ['a whitespace-only email claim', { email: '   ' }],
    ['an email claim with no domain part', { email: 'jsmith' }],
    ['an email claim with inner whitespace', { email: 'js mith@example.com' }],
  ])('returns null for %s', (_, claims) => {
    expect(extractEmailFromIdTokenClaims(buildIdToken(claims))).toBeNull();
  });

  // GitHub, Notion and Stripe issue no id_token at all on their OAuth flows.
  it('returns null when the provider returned no id_token', () => {
    expect(extractEmailFromIdTokenClaims(null)).toBeNull();
    expect(extractEmailFromIdTokenClaims('')).toBeNull();
  });

  it.each([
    ['a non-JWT string', 'not-a-jwt'],
    ['a JWT with a non-JSON payload', 'aGVhZGVy.bm90LWpzb24.c2ln'],
    ['a JWT with a non-object payload', 'aGVhZGVy.Imp1c3QtYS1zdHJpbmci.c2ln'],
  ])('returns null for %s', (_, idToken) => {
    expect(extractEmailFromIdTokenClaims(idToken)).toBeNull();
  });
});
