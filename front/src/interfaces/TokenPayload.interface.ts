export interface TokenPayload {
  'https://hasura.io/jwt/claims': {
    'x-hasura-user-email': string;
    'x-hasura-user-id': string;
  };
}
