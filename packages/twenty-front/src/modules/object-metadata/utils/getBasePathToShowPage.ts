export const getBasePathToShowPage = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const basePathToShowPage = `/object/${objectNameSingular}/`;

  return basePathToShowPage;
};
