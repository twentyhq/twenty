import { type ConnectedAccountProvider } from 'twenty-shared/types';

type ReplyContextLoading = {
  loading: true;
};

export type ReplyContextReady = {
  loading: false;
  to: string;
  subject: string;
  inReplyTo: string;
  connectedAccountId: string;
  connectedAccountProvider: ConnectedAccountProvider;
  messageChannelHandle: string | null;
};

export type ReplyContext = ReplyContextLoading | ReplyContextReady;
