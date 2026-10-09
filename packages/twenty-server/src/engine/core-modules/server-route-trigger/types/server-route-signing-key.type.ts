export type ServerRouteSigningKey = {
  kid: string;
  kty: 'RSA';
  n: string;
  e: string;
  endorsements?: string[];
};
