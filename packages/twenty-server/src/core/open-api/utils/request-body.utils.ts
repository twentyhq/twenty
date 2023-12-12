import { capitalize } from 'src/utils/capitalize';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';

export const requestBody = (item: ObjectMetadataEntity) => {
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
