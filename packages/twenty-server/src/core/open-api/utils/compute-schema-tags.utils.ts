import { OpenAPIV3 } from 'openapi-types';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeSchemaTags = (
  items: ObjectMetadataEntity[],
): OpenAPIV3.TagObject[] => {
  const results = items.map((item) => {
    return {
      name: item.namePlural,
      description: `Object \`${capitalize(item.namePlural)}\``,
    };
  });

  results.push({ name: 'Others', description: 'Other routes' });

  return results;
};
