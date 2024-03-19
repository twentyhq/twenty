import { getLogoUrlFromDomainName } from '~/utils';
import { isDefined } from '~/utils/isDefined';

export const mapFavorites = (favorites: any) => {
  return favorites
    .map((favorite: any) => {
      const recordInformation = isDefined(favorite?.person)
        ? {
            id: favorite.person.id,
            labelIdentifier:
              favorite.person.name.firstName +
              ' ' +
              favorite.person.name.lastName,
            avatarUrl: favorite.person.avatarUrl,
            avatarType: 'rounded',
            link: `/object/person/${favorite.person.id}`,
          }
        : isDefined(favorite?.company)
          ? {
              id: favorite.company.id,
              labelIdentifier: favorite.company.name,
              avatarUrl: getLogoUrlFromDomainName(favorite.company.domainName),
              avatarType: 'squared',
              link: `/object/company/${favorite.company.id}`,
            }
          : undefined;

      return {
        ...recordInformation,
        recordId: recordInformation?.id,
        id: favorite?.id,
        position: favorite?.position,
      };
    })
    .filter(isDefined)
    .sort((a: any, b: any) => a.position - b.position);
};
