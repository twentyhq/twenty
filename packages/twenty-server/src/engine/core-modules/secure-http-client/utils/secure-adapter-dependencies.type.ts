import { type AxiosAdapter } from 'axios';

import type * as dns from 'dns/promises';

export type SecureAdapterDependencies = {
  dnsLookup: typeof dns.lookup;
  httpAdapter: AxiosAdapter;
};
