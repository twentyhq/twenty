type ComputeRelationFieldJoinColumnNameArgs = {
  name: string;
};

export const computeMorphOrRelationFieldJoinColumnName = ({
  name,
}: ComputeRelationFieldJoinColumnNameArgs) => {
  return `${name}Id`;
};
