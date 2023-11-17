import { Company, Person } from '~/generated/graphql';
import { getLogoUrlFromDomainName } from '~/utils';
import { assertNotNull } from '~/utils/assert';
import { isDefined } from '~/utils/isDefined';

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
    .map((favorite: any) => {
      const recordInformation =
        isDefined(favorite?.person) &&
        isDefined(recordsDict[favorite.person.id])
          ? {
              id: favorite.person.id,
              labelIdentifier:
                recordsDict[favorite.person.id].firstName +
                ' ' +
                recordsDict[favorite.person.id].lastName,
              avatarUrl: recordsDict[favorite.person.id].avatarUrl,
              avatarType: 'rounded',
              link: `/object/personV2/${favorite.person.id}`,
            }
          : isDefined(favorite?.company) &&
            isDefined(recordsDict[favorite.company.id])
          ? {
              id: favorite.company.id,
              labelIdentifier: recordsDict[favorite.company.id].name,
              avatarUrl: getLogoUrlFromDomainName(
                recordsDict[favorite.company.id].domainName ?? '',
              ),
              avatarType: 'squared',
              link: `/object/companyV2/${favorite.company.id}`,
            }
          : undefined;

      return {
        ...recordInformation,
        recordId: recordInformation?.id,
        id: favorite?.id,
        position: favorite?.position,
      };
    })
    .filter(assertNotNull)
    .sort((a: any, b: any) => a.position - b.position);
};
