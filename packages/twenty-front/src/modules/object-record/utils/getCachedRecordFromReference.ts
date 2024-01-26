export const getCachedRecordFromReference = ({
  objectNameSingular,
  reference,
}: {
  objectNameSingular: string;
  reference: string;
}) => {
  return {
    __typename: objectNameSingular,
    id: reference,
  };
};
