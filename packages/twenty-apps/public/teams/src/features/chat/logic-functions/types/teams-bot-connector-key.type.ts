import { type JWK } from 'jose';

export type TeamsBotConnectorKey = JWK & {
  kid: string;
  endorsements?: string[];
};
