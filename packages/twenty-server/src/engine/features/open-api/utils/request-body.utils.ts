import { ObjectMetadataEntity } from 'src/engine/api/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const getRequestBody = (
  item: Pick<ObjectMetadataEntity, 'nameSingular'>,
) => {
  return {
    description: 'body',
    required: true,
    content: {
      'application/json': {
        schema: {
          $ref: `#/components/schemas/${capitalize(item.nameSingular)}`,
        },
      },
    },
  };
};
