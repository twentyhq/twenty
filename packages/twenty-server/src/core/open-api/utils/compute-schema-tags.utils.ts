import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { capitalize } from 'src/utils/capitalize';

export const computeSchemaTags = (
  items: ObjectMetadataEntity[],
): { name: string; description: string }[] => {
  return items.map((item) => {
    return {
      name: item.namePlural,
      description: `CRUD for your \`${capitalize(item.namePlural)}\``,
    };
  });
};
