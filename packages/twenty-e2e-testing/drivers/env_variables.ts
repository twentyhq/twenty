import * as fs from 'fs';
import path from 'path';

export const envVariables = (variables: string) => {
  let payload = `
  PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default
  ACCESS_TOKEN_SECRET=replace_me_with_a_random_string_access
  LOGIN_TOKEN_SECRET=replace_me_with_a_random_string_login
  REFRESH_TOKEN_SECRET=replace_me_with_a_random_string_refresh
  FILE_TOKEN_SECRET=replace_me_with_a_random_string_refresh
  REDIS_URL=redis://localhost:6379
  `;
  payload = payload.concat(variables);
  fs.writeFile(
    path.join(__dirname, '..', '..', 'twenty-server', '.env'),
    payload,
    (err) => {
      throw err;
    },
  );
};
