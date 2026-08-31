import { type getDefaultStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { recordPageLayoutByObjectMetadataIdFamilySelector } from '@/page-layout/states/selectors/recordPageLayoutByObjectMetadataIdFamilySelector';
import { getTabListInstanceIdFromPageLayoutAndRecord } from '@/page-layout/utils/getTabListInstanceIdFromPageLayoutAndRecord';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { PageLayoutType } from '~/generated-metadata/graphql';

type RecordPageTabListInstanceIdArgs = {
  recordId: string;
  objectNameSingular: string;
  store: ReturnType<typeof getDefaultStore>;
  surfaceInstanceId?: string;
};

export const getRecordPageTabListInstanceId = ({
  recordId,
  objectNameSingular,
  store,
  surfaceInstanceId,
}: RecordPageTabListInstanceIdArgs) => {
  // Dashboards resolve their page layout from record data, not object metadata
  if (objectNameSingular === CoreObjectNameSingular.Dashboard) {
    return undefined;
  }

  const objectMetadataItem = store.get(
    objectMetadataItemFamilySelector.selectorFamily({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  if (!isDefined(objectMetadataItem)) {
    return undefined;
  }

  const recordPageLayout = store.get(
    recordPageLayoutByObjectMetadataIdFamilySelector.selectorFamily({
      objectMetadataId: objectMetadataItem.id,
    }),
  );

  if (!isDefined(recordPageLayout)) {
    return undefined;
  }

  const pageLayoutId = recordPageLayout.id;

  return getTabListInstanceIdFromPageLayoutAndRecord({
    pageLayoutId,
    layoutType: PageLayoutType.RECORD_PAGE,
    targetRecordIdentifier: {
      id: recordId,
      targetObjectNameSingular: objectNameSingular,
    },
    surfaceInstanceId,
  });
};

export const setRecordPageActiveTabId = ({
  recordId,
  objectNameSingular,
  tabId,
  store,
  surfaceInstanceId,
}: RecordPageTabListInstanceIdArgs & { tabId: string }) => {
  const tabListInstanceId = getRecordPageTabListInstanceId({
    recordId,
    objectNameSingular,
    store,
    surfaceInstanceId,
  });

  if (!isDefined(tabListInstanceId)) {
    return;
  }

  store.set(
    activeTabIdComponentState.atomFamily({ instanceId: tabListInstanceId }),
    tabId,
  );
};
