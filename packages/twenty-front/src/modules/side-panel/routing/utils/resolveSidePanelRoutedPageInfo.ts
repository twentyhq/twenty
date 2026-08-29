import { type getDefaultStore } from 'jotai';
import { matchPath } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { getPathnameFromPath } from '@/side-panel/routing/utils/getPathnameFromPath';

export type SidePanelRoutedPageInfo = {
  title: string;
  iconKey?: string | null;
  iconColor?: string;
};

// The panel top bar names every stack entry, including one reached by
// navigating inside a hosted page, where no caller is around to pass a title.
export const resolveSidePanelRoutedPageInfo = ({
  path,
  store,
}: {
  path: string;
  store: ReturnType<typeof getDefaultStore>;
}): SidePanelRoutedPageInfo => {
  const pathname = getPathnameFromPath(path);
  const objectMetadataItems = store.get(objectMetadataItemsSelector.atom);

  const fieldMatch = matchPath(
    getSettingsPath(SettingsPath.ObjectFieldEdit),
    pathname,
  );

  const objectMatch = matchPath(
    getSettingsPath(SettingsPath.ObjectDetail),
    pathname,
  );

  const objectNamePlural =
    fieldMatch?.params.objectNamePlural ?? objectMatch?.params.objectNamePlural;

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.namePlural === objectNamePlural,
  );

  if (isDefined(fieldMatch) && isDefined(objectMetadataItem)) {
    const fieldMetadataItem = objectMetadataItem.fields.find(
      (item) => item.name === fieldMatch.params.fieldName,
    );

    if (isDefined(fieldMetadataItem)) {
      return {
        title: fieldMetadataItem.label,
        iconKey: fieldMetadataItem.icon,
      };
    }
  }

  if (isDefined(objectMatch) && isDefined(objectMetadataItem)) {
    return {
      title: objectMetadataItem.labelPlural,
      iconKey: objectMetadataItem.icon,
      iconColor: getIconColorForObjectType(objectMetadataItem.nameSingular),
    };
  }

  return { title: '' };
};
