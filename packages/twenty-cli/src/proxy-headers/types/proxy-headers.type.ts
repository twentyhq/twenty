export type ProxyHeaders = {
  read: (signal: AbortSignal) => Promise<Record<string, string>>;
  isRenewable: boolean;
  renew: () => void;
};
