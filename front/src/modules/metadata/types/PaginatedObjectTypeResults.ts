export type PaginatedObjectTypeResults<ObjectType extends { id: string }> = {
  edges: {
    node: ObjectType;
    cursor: string;
  }[];
};
