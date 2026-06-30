import { type getDefaultStore } from 'jotai';
import { type Location, matchPath } from 'react-router-dom';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getDefaultRecordPageLayoutId } from '@/page-layout/utils/getDefaultRecordPageLayoutId';

const DASHBOARD_NAME_SINGULAR = CoreObjectNameSingular.Dashboard;

export const getPageLayoutIdForLocation = ({
  location,
  store,
}: {
  location: Location;
  store: ReturnType<typeof getDefaultStore>;
}): string | null => {
  const recordShowMatch = matchPath(AppPath.RecordShowPage, location.pathname);

  if (isDefined(recordShowMatch?.params.objectNameSingular)) {
    const objectNameSingular = recordShowMatch.params.objectNameSingular;

    if (objectNameSingular === DASHBOARD_NAME_SINGULAR) {
      return null;
    }

    const objectMetadataItem = store.get(
      objectMetadataItemFamilySelector.selectorFamily({
        objectName: objectNameSingular,
        objectNameType: 'singular',
      }),
    );

    if (!isDefined(objectMetadataItem)) {
      return null;
    }

    const recordPageLayout = store.get(
      recordPageLayoutByObjectMetadataIdFamilySelector.selectorFamily({
        objectMetadataId: objectMetadataItem.id,
      }),
    );

    return isDefined(recordPageLayout)
      ? recordPageLayout.id
      : getDefaultRecordPageLayoutId({
          targetObjectNameSingular: objectNameSingular,
        });
  }

  const pageLayoutMatch = matchPath(AppPath.PageLayoutPage, location.pathname);

  if (isDefined(pageLayoutMatch?.params.pageLayoutId)) {
    return pageLayoutMatch.params.pageLayoutId;
  }

  return null;
};
