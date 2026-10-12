import { readBooleanOption } from '@/catalog/read-command-values';
import { type CommandRun } from '@/catalog/types/command-run.type';
import { type TargetCommandContext } from '@/catalog/types/target-command-context.type';
import { collectMetadataNodes } from '@/metadata/collect-metadata-nodes';
import { formatMetadataOwner } from '@/metadata/format-metadata-owner';
import { METADATA_OWNER_KIND_ORDER } from '@/metadata/constants/metadata-owner-kind-order.constant';
import { METADATA_PAGE_SIZE } from '@/metadata/constants/metadata-page.constant';
import { createMetadataOwnerResolver } from '@/metadata/resolve-metadata-owner';
import { fetchOwnerApplications } from '@/metadata/fetch-owner-applications';
import { formatTable } from '@/output/format-table';
import { dimText } from '@/output/style';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

type MetadataClient = ReturnType<typeof createMetadataClient>;

const fetchObjects = (client: MetadataClient, after?: string) =>
  client.query({
    objects: {
      __args: { paging: { first: METADATA_PAGE_SIZE, after }, filter: {} },
      pageInfo: { hasNextPage: true, endCursor: true },
      edges: {
        node: {
          nameSingular: true,
          namePlural: true,
          labelSingular: true,
          labelPlural: true,
          isSystem: true,
          isActive: true,
          applicationId: true,
        },
      },
    },
    currentWorkspace: { workspaceCustomApplicationId: true },
  });

export const runMetadataObjectListCommand: CommandRun<
  TargetCommandContext
> = async ({ options, output, target, signal }) => {
  const includeSystemObjects = readBooleanOption(options, 'all');
  const client = createMetadataClient({ target, signal });
  const [{ objects, currentWorkspace }, { applications, areOwnersNamed }] =
    await Promise.all([fetchObjects(client), fetchOwnerApplications(client)]);

  const objectNodes = await collectMetadataNodes(async (after) =>
    after === undefined ? objects : (await fetchObjects(client, after)).objects,
  );

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
  const allObjects = objectNodes.map(({ applicationId, ...object }) => ({
    ...object,
    owner: resolveOwner(applicationId),
  }));
  const listedObjects = allObjects
    .filter((object) => includeSystemObjects || !object.isSystem)
    .sort((first, second) => {
      const ownerKindDifference =
        METADATA_OWNER_KIND_ORDER.indexOf(first.owner.kind) -
        METADATA_OWNER_KIND_ORDER.indexOf(second.owner.kind);

      if (ownerKindDifference !== 0) {
        return ownerKindDifference;
      }

      return first.namePlural.localeCompare(second.namePlural);
    });
  const hiddenSystemObjectCount = allObjects.length - listedObjects.length;

  return {
    data: { objects: listedObjects, hiddenSystemObjectCount },
    human: [
      formatTable({
        rows: listedObjects,
        columns: [
          { header: 'API NAME', value: (object) => object.namePlural },
          {
            header: 'LABEL',
            value: (object) =>
              object.isActive
                ? object.labelPlural
                : `${object.labelPlural} ${dimText('(inactive)')}`,
          },
          {
            header: 'OWNER',
            value: (object) => formatMetadataOwner(object.owner),
          },
        ],
      }),
      dimText(
        hiddenSystemObjectCount > 0
          ? `${listedObjects.length} objects · ${hiddenSystemObjectCount} system objects hidden, show them with --all`
          : `${listedObjects.length} objects`,
      ),
    ].join('\n'),
  };
};
