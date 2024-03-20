import { OpenAPIV3_1 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeSchemaTags = (
  items: ObjectMetadataEntity[],
): OpenAPIV3_1.TagObject[] => {
  const results = [{ name: 'General', description: 'General requests' }];

  items.forEach((item) => {
    results.push({
      name: item.namePlural,
      description: `Object \`${capitalize(item.namePlural)}\``,
    });
  });

  return results;
};
