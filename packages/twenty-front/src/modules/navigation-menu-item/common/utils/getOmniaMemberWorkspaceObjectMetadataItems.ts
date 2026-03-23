import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const OMNIA_MEMBER_WORKSPACE_OBJECT_NAMES = [
  CoreObjectNameSingular.Person,
  'call',
  'policy',
  CoreObjectNameSingular.Note,
  CoreObjectNameSingular.Task,
] as const;

export const getOmniaMemberWorkspaceObjectMetadataItems = (
  objectMetadataItems: EnrichedObjectMetadataItem[],
): EnrichedObjectMetadataItem[] => {
  const objectMetadataItemsByNameSingular = new Map(
    objectMetadataItems.map((objectMetadataItem) => [
      objectMetadataItem.nameSingular,
      objectMetadataItem,
    ]),
  );

  return OMNIA_MEMBER_WORKSPACE_OBJECT_NAMES.flatMap((nameSingular) => {
    const objectMetadataItem =
      objectMetadataItemsByNameSingular.get(nameSingular);

    return objectMetadataItem ? [objectMetadataItem] : [];
  });
};
