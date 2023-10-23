export type PaginatedObjectType<ObjectType extends { id: string }> = {
  [objectNamePlural: string]: {
    edges: {
      node: ObjectType;
      cursor: string;
    }[];
  };
};
