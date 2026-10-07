import { type fetchMetadataInspection } from '@/metadata/fetch-metadata-inspection';

export type MetadataInspection = Awaited<
  ReturnType<typeof fetchMetadataInspection>
>;
export type InspectedField = MetadataInspection['fields'][number];
