import { type Resolver } from 'dns/promises';

import { type ExpectedDnsRecord } from 'src/engine/core-modules/dns-manager/types/expected-dns-record.type';

export const resolveDnsRecordValues = async ({
  resolver,
  record,
}: {
  resolver: Resolver;
  record: ExpectedDnsRecord;
}): Promise<string[]> => {
  switch (record.type) {
    case 'CNAME':
      return resolver.resolveCname(record.key);
    case 'MX':
      return (await resolver.resolveMx(record.key)).map(
        ({ exchange }) => exchange,
      );
    case 'TXT':
      return (await resolver.resolveTxt(record.key)).map((chunks) =>
        chunks.join(''),
      );
  }
};
