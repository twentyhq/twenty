export type LinksFieldValue = {
  primaryLinkLabel: string;
  primaryLinkUrl: string;
  secondaryLinks: null;
};

export function toLinksField(url: string, label = ''): LinksFieldValue {
  return { primaryLinkLabel: label, primaryLinkUrl: url, secondaryLinks: null };
}
