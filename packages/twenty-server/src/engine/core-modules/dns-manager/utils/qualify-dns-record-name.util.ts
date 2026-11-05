import { normalizeDnsText } from 'src/engine/core-modules/dns-manager/utils/normalize-dns-text.util';

export const qualifyDnsRecordName = (name: string, domain: string): string => {
  const normalizedName = normalizeDnsText(name);
  const normalizedDomain = normalizeDnsText(domain);

  return normalizedName === normalizedDomain ||
    normalizedName.endsWith(`.${normalizedDomain}`)
    ? normalizedName
    : `${normalizedName}.${normalizedDomain}`;
};
