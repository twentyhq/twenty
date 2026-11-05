import { normalizeDnsText } from 'src/engine/core-modules/dns-manager/utils/normalize-dns-text.util';

export const qualifyDnsRecordName = ({
  name,
  domain,
}: {
  name: string;
  domain: string;
}): string => {
  const normalizedName = normalizeDnsText(name);
  const normalizedDomain = normalizeDnsText(domain);

  if (
    normalizedName === normalizedDomain ||
    normalizedName.endsWith(`.${normalizedDomain}`)
  ) {
    return normalizedName;
  }

  return `${normalizedName}.${normalizedDomain}`;
};
