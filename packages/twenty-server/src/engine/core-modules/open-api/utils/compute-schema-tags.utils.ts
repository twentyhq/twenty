import { type OpenAPIV3_1 } from 'openapi-types';
import { capitalize } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const computeSchemaTags = (
  items: Pick<FlatObjectMetadata, 'nameSingular' | 'namePlural'>[],
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
