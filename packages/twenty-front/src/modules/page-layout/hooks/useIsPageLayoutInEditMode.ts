import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PageLayoutType } from '~/generated-metadata/graphql';

export const useIsPageLayoutInEditMode = () => {
  const isLayoutCustomizationActive = useAtomStateValue(
    isLayoutCustomizationActiveState,
  );

  const pageLayoutPersisted = useAtomComponentStateValue(
    pageLayoutPersistedComponentState,
  );

  const isDashboardInEditMode = useAtomComponentStateValue(
    isDashboardInEditModeComponentState,
  );

  const isRecordPageLayout =
    pageLayoutPersisted?.type === PageLayoutType.RECORD_PAGE;

  return isRecordPageLayout
    ? isLayoutCustomizationActive
    : isDashboardInEditMode;
};
