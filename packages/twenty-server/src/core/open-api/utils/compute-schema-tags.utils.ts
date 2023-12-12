import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeSchemaTags = (
  items: ObjectMetadataEntity[],
): { name: string; description: string }[] => {
  const results = items.map((item) => {
    return {
      name: item.namePlural,
      description: `Object \`${capitalize(item.namePlural)}\``,
    };
  });

  results.push({ name: 'Others', description: 'Other routes' });

  return results;
};
