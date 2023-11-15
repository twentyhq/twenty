import { Company, Person } from '~/generated/graphql';
import { assertNotNull } from '~/utils/assert';

export const mapFavorites = (
  favorites: any,
  recordsDict: {
    [key: string]: {
      firstName?: Person['firstName'];
      lastName?: Person['lastName'];
      avatarUrl?: Person['avatarUrl'];
      name?: Company['name'];
      domainName?: Company['domainName'];
    };
  },
) => {
  return favorites
    .map(({ node: favorite }: any) => {
      const recordInformation = favorite.person
        ? {
            id: favorite.person.id,
            firstName: recordsDict[favorite.person?.id] ?? '',
            lastName: recordsDict[favorite.person?.id] ?? '',
            avatarUrl: recordsDict[favorite.person?.id] ?? '',
          }
        : favorite.company
        ? {
            id: favorite.company.id,
            name: recordsDict[favorite.company?.id] ?? '',
            domainName: recordsDict[favorite.company?.id] ?? '',
          }
        : undefined;

      return {
        id: favorite.id,
        person: favorite.person ?? recordInformation,
        company: favorite.company ?? recordInformation,
        position: favorite.position,
      };
    })
    .filter(assertNotNull);
};
