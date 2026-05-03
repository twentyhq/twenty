import { WebClient } from '@slack/web-api';

export const createSlackWebClient = (botToken: string): WebClient =>
  new WebClient(botToken);
