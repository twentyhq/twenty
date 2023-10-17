import { MetadataObjectsQuery } from '~/generated-metadata/graphql';

import { MetadataObject } from '../types/MetadataObject';

export const formatPagedMetadataObjectsToMetadataObjects = ({
  pagedMetadataObjects: pagedMetadataObjects,
}: {
  pagedMetadataObjects: MetadataObjectsQuery | undefined;
}) => {
  const formattedObjects: MetadataObject[] =
    pagedMetadataObjects?.objects.edges.map((object) => ({
      ...object.node,
      fields: object.node.fields.edges.map((field) => field.node),
    })) ?? [];

  return formattedObjects;
};
