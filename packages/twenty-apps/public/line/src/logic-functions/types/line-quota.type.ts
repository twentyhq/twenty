export type LineQuota =
  | { status: 'notConnected' }
  | {
      status: 'connected';
      accountName: string;
      // null when no monthly target limit is set
      limit: number | null;
      used: number;
    };
