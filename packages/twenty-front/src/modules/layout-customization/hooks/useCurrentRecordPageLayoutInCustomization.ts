import { useAtomValue } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PageLayoutType } from '~/generated-metadata/graphql';

type CurrentRecordPageLayoutInCustomization = {
  pageLayoutId: string;
  objectLabelPlural: string;
};

export const useCurrentRecordPageLayoutInCustomization =
  (): CurrentRecordPageLayoutInCustomization | null => {
    const currentPageLayoutId = useAtomStateValue(currentPageLayoutIdState);

    const pageLayoutPersisted = useAtomValue(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: currentPageLayoutId ?? '',
      }),
    );

    const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

    if (!isDefined(currentPageLayoutId)) {
      return null;
    }

    if (!isDefined(pageLayoutPersisted)) {
      return null;
    }

    if (pageLayoutPersisted.type !== PageLayoutType.RECORD_PAGE) {
      return null;
    }

    if (!isDefined(pageLayoutPersisted.objectMetadataId)) {
      return null;
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === pageLayoutPersisted.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return null;
    }

    return {
      pageLayoutId: currentPageLayoutId,
      objectLabelPlural: objectMetadataItem.labelPlural,
    };
  };
