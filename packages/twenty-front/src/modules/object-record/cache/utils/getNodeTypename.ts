import { capitalize } from '~/utils/string/capitalize';

export const getNodeTypename = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  return capitalize(objectNameSingular);
};
