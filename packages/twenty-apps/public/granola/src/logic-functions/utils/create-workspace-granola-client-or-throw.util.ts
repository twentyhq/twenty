import { GRANOLA_API_KEY_ENV_VAR_NAME } from 'src/logic-functions/constants/granola-api-key-env-var-name';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

export const createWorkspaceGranolaClientOrThrow = () =>
  createGranolaClientOrThrow({
    apiKey: process.env[GRANOLA_API_KEY_ENV_VAR_NAME],
  });
