export type GoogleMeetCollectionPage<TCollectionKey extends string, TItem> = {
  [collectionKey in TCollectionKey]?: TItem[];
} & { nextPageToken?: string };
