import { type getDefaultStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getDefaultRecordPageLayoutId } from '@/page-layout/utils/getDefaultRecordPageLayoutId';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const setRecordPageActiveTabId = ({
  recordId,
  objectNameSingular,
  tabId,
  store,
}: {
  recordId: string;
  objectNameSingular: string;
  tabId: string;
  store: ReturnType<typeof getDefaultStore>;
}) => {
  // Dashboards resolve their page layout from record data, not object metadata
  if (objectNameSingular === CoreObjectNameSingular.Dashboard) {
    return;
  }

  const objectMetadataItem = store.get(
    objectMetadataItemFamilySelector.selectorFamily({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  if (!isDefined(objectMetadataItem)) {
    return;
  }

  const recordPageLayout = store.get(
    recordPageLayoutByObjectMetadataIdFamilySelector.selectorFamily({
      objectMetadataId: objectMetadataItem.id,
    }),
  );

  const pageLayoutId = isDefined(recordPageLayout)
    ? recordPageLayout.id
    : getDefaultRecordPageLayoutId({
        targetObjectNameSingular: objectNameSingular,
      });

  const tabListInstanceId = getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: PageLayoutType.RECORD_PAGE,
    targetRecordIdentifier: {
      id: recordId,
      targetObjectNameSingular: objectNameSingular,
    },
  });

  store.set(
    activeTabIdComponentState.atomFamily({ instanceId: tabListInstanceId }),
    tabId,
  );
};
