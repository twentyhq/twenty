export type GraphCollectionPage<TItem> = {
  value?: TItem[];
  '@odata.nextLink'?: string;
  '@odata.deltaLink'?: string;
};
