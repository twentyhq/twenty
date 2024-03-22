import { GraphQLView } from '@/views/types/GraphQLView';

export const getObjectMetadataItemViews = (
  viewObjectMetadataId: string,
  views: GraphQLView[],
) => {
  const indexView = views.find(
    (view) =>
      view.key === 'INDEX' && view.objectMetadataId === viewObjectMetadataId,
  );

  return [
    ...views
      .filter((view) => view.objectMetadataId === viewObjectMetadataId)
      .filter((view) => view.key !== 'INDEX'),
  ]
    .sort((a, b) => a.position - b.position)
    .concat(indexView ? [indexView] : [])
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
