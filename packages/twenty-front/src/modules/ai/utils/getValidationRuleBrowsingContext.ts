import { matchPath } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { type BrowsingContext } from '@/ai/types/BrowsingContext';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const getValidationRuleBrowsingContext = ({
  pathname,
  objectMetadataItems,
}: {
  pathname: string;
  objectMetadataItems: Pick<
    ObjectMetadataItem,
    'id' | 'nameSingular' | 'namePlural'
  >[];
}): Extract<BrowsingContext, { type: 'validationRule' }> | null => {
  const validationRuleEditMatch = matchPath(
    getSettingsPath(SettingsPath.ObjectValidationRuleEdit),
    pathname,
  );
  const newValidationRuleMatch = matchPath(
    getSettingsPath(SettingsPath.ObjectNewValidationRule),
    pathname,
  );

  const objectNamePlural =
    validationRuleEditMatch?.params.objectNamePlural ??
    newValidationRuleMatch?.params.objectNamePlural;

  const objectMetadataItem = isDefined(objectNamePlural)
    ? objectMetadataItems.find((item) => item.namePlural === objectNamePlural)
    : undefined;

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return {
    type: 'validationRule',
    objectMetadataId: objectMetadataItem.id,
    objectNameSingular: objectMetadataItem.nameSingular,
    validationRuleId: validationRuleEditMatch?.params.validationRuleId,
  };
};
