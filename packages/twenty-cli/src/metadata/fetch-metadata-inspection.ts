import { collectMetadataNodes } from '@/metadata/collect-metadata-nodes';
import { METADATA_PAGE_SIZE } from '@/metadata/constants/metadata-page.constant';
import { fetchOwnerApplications } from '@/metadata/fetch-owner-applications';
import { createMetadataOwnerResolver } from '@/metadata/resolve-metadata-owner';
import { resolveMetadataObject } from '@/metadata/resolve-metadata-object';
import { type Output } from '@/output/types/output.type';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

const RELATION_SELECTION = {
  type: true,
  sourceObjectMetadata: { id: true, nameSingular: true, namePlural: true },
  targetObjectMetadata: { id: true, nameSingular: true, namePlural: true },
  sourceFieldMetadata: { id: true, name: true },
  targetFieldMetadata: { id: true, name: true },
} as const;

export const fetchMetadataInspection = async ({
  objectName,
  target,
  signal,
  output,
}: {
  objectName: string;
  target: ResolvedTarget;
  signal: AbortSignal;
  output: Output;
}) => {
  const client = createMetadataClient({ target, signal });
  const object = await resolveMetadataObject({ client, name: objectName });
  const [fields, { currentWorkspace }, { applications, areOwnersNamed }] =
    await Promise.all([
      collectMetadataNodes(async (after) => {
        const { fields } = await client.query({
          fields: {
            __args: {
              paging: { first: METADATA_PAGE_SIZE, after },
              filter: { objectMetadataId: { eq: object.id } },
            },
            pageInfo: { hasNextPage: true, endCursor: true },
            edges: {
              node: {
                id: true,
                universalIdentifier: true,
                objectMetadataId: true,
                name: true,
                label: true,
                description: true,
                type: true,
                isActive: true,
                isSystem: true,
                isNullable: true,
                isUnique: true,
                defaultValue: true,
                options: true,
                settings: true,
                applicationId: true,
                relation: RELATION_SELECTION,
                morphRelations: RELATION_SELECTION,
              },
            },
          },
        });

        return fields;
      }),
      client.query({
        currentWorkspace: { workspaceCustomApplicationId: true },
      }),
      fetchOwnerApplications(client),
    ]);

  if (!areOwnersNamed) {
    output.warn({
      code: 'OWNERS_UNAVAILABLE',
      message:
        'Owners other than Custom show as unknown: listing apps needs the Applications permission.',
    });
  }

  const resolveOwner = createMetadataOwnerResolver({
    applications,
    workspaceCustomApplicationId: currentWorkspace.workspaceCustomApplicationId,
  });
  const { applicationId, ...objectMetadata } = object;

  return {
    object: { ...objectMetadata, owner: resolveOwner(applicationId) },
    fields: fields
      .map(({ applicationId, ...field }) => ({
        ...field,
        owner: resolveOwner(applicationId),
      }))
      .sort((first, second) => first.name.localeCompare(second.name)),
  };
};
