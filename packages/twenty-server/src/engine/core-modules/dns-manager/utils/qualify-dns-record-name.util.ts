import { normalizeDnsText } from 'src/engine/core-modules/dns-manager/utils/normalize-dns-text.util';

const findParentZone = ({
  name,
  domain,
}: {
  name: string;
  domain: string;
}): string => {
  const domainLabels = domain.split('.');

  for (
    let subdomainLabelCount = domainLabels.length - 1;
    subdomainLabelCount > 0;
    subdomainLabelCount--
  ) {
    const subdomain = domainLabels.slice(0, subdomainLabelCount).join('.');

    if (name.endsWith(`.${subdomain}`)) {
      return domainLabels.slice(subdomainLabelCount).join('.');
    }
  }

  return domain;
};

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

  return `${normalizedName}.${findParentZone({
    name: normalizedName,
    domain: normalizedDomain,
  })}`;
};
