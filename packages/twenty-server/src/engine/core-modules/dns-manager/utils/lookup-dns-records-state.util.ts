import { Resolver } from 'dns/promises';

import { DNS_LOOKUP_RESOLVER_OPTIONS } from 'src/engine/core-modules/dns-manager/constants/dns-lookup-resolver-options.constant';
import { type DnsRecordLookupState } from 'src/engine/core-modules/dns-manager/types/dns-record-lookup-state.type';
import { type ExpectedDnsRecord } from 'src/engine/core-modules/dns-manager/types/expected-dns-record.type';
import { isMissingDnsRecordError } from 'src/engine/core-modules/dns-manager/utils/is-missing-dns-record-error.util';
import { normalizeDnsText } from 'src/engine/core-modules/dns-manager/utils/normalize-dns-text.util';
import { resolveDnsRecordValues } from 'src/engine/core-modules/dns-manager/utils/resolve-dns-record-values.util';

const isMatchingRecord = ({
  record,
  foundValues,
}: {
  record: ExpectedDnsRecord;
  foundValues: string[];
}): boolean => {
  switch (record.type) {
    case 'TXT':
      return foundValues
        .map((value) => value.trim())
        .includes(record.value.trim());
    case 'CNAME':
    case 'MX':
      return (
        foundValues.length === 1 &&
        normalizeDnsText(foundValues[0]) === normalizeDnsText(record.value)
      );
  }
};

const lookupDnsRecordState = async ({
  resolver,
  record,
}: {
  resolver: Resolver;
  record: ExpectedDnsRecord;
}): Promise<DnsRecordLookupState> => {
  try {
    const foundValues = await resolveDnsRecordValues({ resolver, record });

    return isMatchingRecord({ record, foundValues }) ? 'found' : 'missing';
  } catch (error) {
    return isMissingDnsRecordError(error) ? 'missing' : 'unknown';
  }
};

export const lookupDnsRecordsState = async (
  records: ExpectedDnsRecord[],
): Promise<DnsRecordLookupState> => {
  if (records.length === 0) {
    return 'unknown';
  }

  const resolver = new Resolver(DNS_LOOKUP_RESOLVER_OPTIONS);

  const states = await Promise.all(
    records.map((record) => lookupDnsRecordState({ resolver, record })),
  );

  if (states.includes('missing')) {
    return 'missing';
  }

  return states.includes('unknown') ? 'unknown' : 'found';
};
