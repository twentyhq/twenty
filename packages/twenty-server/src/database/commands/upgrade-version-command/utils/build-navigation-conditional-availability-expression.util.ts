import { HIDDEN_NAVIGATION_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/flat-command-menu-item/constants/hidden-navigation-object-universal-identifiers.constant';

export const buildNavigationConditionalAvailabilityExpression = ({
  universalIdentifier,
  nameSingular,
}: {
  universalIdentifier: string;
  nameSingular: string;
}): string => {
  if (HIDDEN_NAVIGATION_OBJECT_UNIVERSAL_IDENTIFIERS.has(universalIdentifier)) {
    return 'false';
  }

  return `targetObjectReadPermissions.${nameSingular}`;
};
