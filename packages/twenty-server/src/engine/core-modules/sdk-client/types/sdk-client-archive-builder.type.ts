export type SdkClientArchiveBuilder = {
  buildArchive: (params: { schema: string }) => Promise<Buffer>;
};
