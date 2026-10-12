import { isDefined } from 'twenty-shared/utils';

import { collectMetadataNodes } from '@/metadata/collect-metadata-nodes';
import { METADATA_PAGE_SIZE } from '@/metadata/constants/metadata-page.constant';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const resolveMetadataObject = async ({
  client,
  name,
}: {
  client: ReturnType<typeof createMetadataClient>;
  name: string;
}) => {
  const objects = await collectMetadataNodes(async (after) => {
    const { objects } = await client.query({
      objects: {
        __args: { paging: { first: METADATA_PAGE_SIZE, after }, filter: {} },
        pageInfo: { hasNextPage: true, endCursor: true },
        edges: {
          node: {
            id: true,
            universalIdentifier: true,
            nameSingular: true,
            namePlural: true,
            labelSingular: true,
            labelPlural: true,
            description: true,
            isActive: true,
            isSystem: true,
            isSearchable: true,
            labelIdentifierFieldMetadataId: true,
            applicationId: true,
          },
        },
      },
    });

    return objects;
  });
  const matches = objects.filter(
    (object) => object.nameSingular === name || object.namePlural === name,
  );

  if (matches.length > 1) {
    throw new CliError({
      code: 'AMBIGUOUS_RESOURCE',
      exitCode: EXIT_CODE.USAGE,
      message: `More than one object has the API name ${name}.`,
      hint: 'Use an unambiguous singular or plural API name.',
      details: {
        matches: matches
          .map(({ id, nameSingular, namePlural }) => ({
            id,
            nameSingular,
            namePlural,
          }))
          .sort((first, second) =>
            first.namePlural.localeCompare(second.namePlural),
          ),
      },
    });
  }

  const object = matches[0];

  if (!isDefined(object)) {
    throw new CliError({
      code: 'NOT_FOUND',
      exitCode: EXIT_CODE.NOT_FOUND,
      message: `No object has the API name ${name}.`,
      hint: 'Use an exact singular or plural API name from twenty metadata object list --all.',
    });
  }

  return object;
};
