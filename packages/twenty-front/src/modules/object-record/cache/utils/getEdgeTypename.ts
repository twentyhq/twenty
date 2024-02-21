import { capitalize } from '~/utils/string/capitalize';

export const getEdgeTypename = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `${capitalize(objectNameSingular)}Edge`;
};
