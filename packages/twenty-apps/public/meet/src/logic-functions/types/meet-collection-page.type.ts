export type MeetCollectionPage<TCollectionKey extends string, TItem> = {
  [collectionKey in TCollectionKey]?: TItem[];
} & { nextPageToken?: string };
