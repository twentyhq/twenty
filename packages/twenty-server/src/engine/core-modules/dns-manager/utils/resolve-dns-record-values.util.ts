import { type Resolver } from 'dns/promises';

import { type ExpectedDnsRecord } from 'src/engine/core-modules/dns-manager/types/expected-dns-record.type';

export const resolveDnsRecordValues = async (
  resolver: Resolver,
  { type, key }: ExpectedDnsRecord,
): Promise<string[]> => {
  switch (type) {
    case 'CNAME':
      return resolver.resolveCname(key);
    case 'MX':
      return (await resolver.resolveMx(key)).map(({ exchange }) => exchange);
    case 'TXT':
      return (await resolver.resolveTxt(key)).map((chunks) => chunks.join(''));
  }
};
