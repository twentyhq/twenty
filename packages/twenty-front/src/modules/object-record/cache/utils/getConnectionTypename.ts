import { capitalize } from '~/utils/string/capitalize';

export const getConnectionTypename = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return `${capitalize(objectNameSingular)}Connection`;
};
