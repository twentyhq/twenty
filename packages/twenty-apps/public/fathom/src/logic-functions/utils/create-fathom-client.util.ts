import { Fathom } from 'fathom-typescript';

export const createFathomClient = (accessToken: string): Fathom =>
  new Fathom({ security: { bearerAuth: accessToken } });
