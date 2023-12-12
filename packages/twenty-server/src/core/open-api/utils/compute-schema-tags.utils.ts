import { OpenAPIV3 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeSchemaTags = (
  items: ObjectMetadataEntity[],
): OpenAPIV3.TagObject[] => {
  const results = [{ name: 'General', description: 'General requests' }];

  items.forEach((item) => {
    results.push({
      name: item.namePlural,
      description: `Object \`${capitalize(item.namePlural)}\``,
    });
  });

  return results;
};
