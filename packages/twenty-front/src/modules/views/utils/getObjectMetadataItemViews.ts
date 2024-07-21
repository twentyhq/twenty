import { GraphQLView } from '@/views/types/GraphQLView';

export const getObjectMetadataItemViews = (
  viewObjectMetadataId: string,
  views: GraphQLView[],
) => {
  return [
    ...views.filter((view) => view.objectMetadataId === viewObjectMetadataId),
  ]
    .sort((a, b) => a.position - b.position)

    .map((view) => ({
      id: view.id,
      name: view.name,
      type: view.type,
      key: view.key,
      position: view.position,
      objectMetadataId: view.objectMetadataId,
      kanbanFieldMetadataId: view.kanbanFieldMetadataId,
      icon: view.icon,
    }));
};
