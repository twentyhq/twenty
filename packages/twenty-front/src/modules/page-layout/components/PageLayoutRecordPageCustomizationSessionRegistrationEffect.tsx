import { activeCustomizationPageLayoutIdsState } from '@/app/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const PageLayoutRecordPageCustomizationSessionRegistrationEffect = () => {
  const store = useStore();
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );
  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );

  useEffect(() => {
    if (!isLayoutCustomizationActive) {
      return;
    }

    if (!isDefined(pageLayoutPersisted)) {
      return;
    }

    if (pageLayoutPersisted.type !== PageLayoutType.RECORD_PAGE) {
      return;
    }

    store.set(activeCustomizationPageLayoutIdsState.atom, (activeIds) =>
      activeIds.includes(pageLayoutPersisted.id)
        ? activeIds
        : [...activeIds, pageLayoutPersisted.id],
    );
  }, [isLayoutCustomizationActive, pageLayoutPersisted, store]);

  return null;
};
