import { type ConnectedAccountProvider } from 'twenty-shared/types';

export type ConnectedAccountGroupTab =
  | {
      id: string;
      type: 'email' | 'calendar';
      provider: ConnectedAccountProvider;
      connectedAccountIds: string[];
      channelIds: string[];
    }
  | {
      id: string;
      type: 'app';
      applicationId: string;
      connectedAccountIds: string[];
    }
  | { id: string; type: 'connection'; connectedAccountIds: string[] };
