export const formatPagedObjectsToObjects = <
  ObjectType extends { id: string } & Record<string, any>,
  ObjectTypeQuery extends {
    [objectNamePlural: string]: {
      edges: ObjectEdge[];
    };
  },
  ObjectEdge extends {
    node: ObjectType;
  },
>({
  pagedObjects,
  objectNamePlural,
}: {
  pagedObjects: ObjectTypeQuery | undefined;
  objectNamePlural: string;
}) => {
  const formattedObjects: ObjectType[] =
    pagedObjects?.[objectNamePlural].edges.map((objectEdge: ObjectEdge) => ({
      ...objectEdge.node,
    })) ?? [];

  return formattedObjects;
};
