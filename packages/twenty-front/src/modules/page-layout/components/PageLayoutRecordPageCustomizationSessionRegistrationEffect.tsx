import { activeCustomizationPageLayoutIdsState } from '@/layout-customization/states/activeCustomizationPageLayoutIdsState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { normalizeVerticalListWidgetsInDraftPageLayout } from '@/page-layout/utils/normalizeVerticalListWidgetsInDraftPageLayout';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
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
    const isPageLayoutInEditMode = useIsPageLayoutInEditMode();
    const pageLayoutPersisted = useAtomComponentStateValue(
      pageLayoutPersistedComponentState,
    );
    const pageLayoutDraftState = useAtomComponentStateCallbackState(
      pageLayoutDraftComponentState,
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

      if (isPageLayoutInEditMode) {
        store.set(
          pageLayoutDraftState,
          normalizeVerticalListWidgetsInDraftPageLayout,
        );
      }

      store.set(activeCustomizationPageLayoutIdsState.atom, (activeIds) =>
        activeIds.includes(pageLayoutPersisted.id)
          ? activeIds
          : [...activeIds, pageLayoutPersisted.id],
      );
    }, [
      isLayoutCustomizationModeEnabled,
      isPageLayoutInEditMode,
      pageLayoutDraftState,
      pageLayoutPersisted,
      store,
    ]);

    return null;
  };
