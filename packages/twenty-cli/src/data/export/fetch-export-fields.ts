import { collectMetadataNodes } from '@/metadata/collect-metadata-nodes';
import { METADATA_PAGE_SIZE } from '@/metadata/constants/metadata-page.constant';
import { type createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchExportFields = async ({
  client,
  objectMetadataId,
}: {
  client: ReturnType<typeof createMetadataClient>;
  objectMetadataId: string;
}) =>
  collectMetadataNodes(async (after) => {
    const { fields } = await client.query({
      fields: {
        __args: {
          paging: { first: METADATA_PAGE_SIZE, after },
          filter: { objectMetadataId: { eq: objectMetadataId } },
        },
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: {
          node: { id: true, name: true, isActive: true, isSystem: true },
        },
      },
    });
    return fields;
  });
