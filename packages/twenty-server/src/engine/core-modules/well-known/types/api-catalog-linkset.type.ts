// RFC 9727 / RFC 9264 linkset shapes for /.well-known/api-catalog. Each entry
// is anchored at an API's canonical URL, with typed link relations pointing to
// its machine spec (service-desc), human docs (service-doc), and metadata
// (service-meta).

export type ApiCatalogLink = {
  href: string;
  type?: string;
};

export type ApiCatalogLinksetEntry = {
  anchor: string;
  'service-desc'?: ApiCatalogLink[];
  'service-doc'?: ApiCatalogLink[];
  'service-meta'?: ApiCatalogLink[];
  status?: ApiCatalogLink[];
};

export type ApiCatalogLinkset = {
  linkset: ApiCatalogLinksetEntry[];
};
