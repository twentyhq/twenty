import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
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
