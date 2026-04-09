import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const PageLayoutRecordPageCustomizationSessionRegistrationEffect =
  () => {
    const store = useStore();
    const isLayoutCustomizationModeEnabled = useAtomStateValue(
      isLayoutCustomizationModeEnabledState,
    );
    const pageLayoutPersisted = useAtomComponentStateValue(
      pageLayoutPersistedComponentState,
    );

    useEffect(() => {
      if (!isLayoutCustomizationModeEnabled) {
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
    }, [isLayoutCustomizationModeEnabled, pageLayoutPersisted, store]);

    return null;
  };
