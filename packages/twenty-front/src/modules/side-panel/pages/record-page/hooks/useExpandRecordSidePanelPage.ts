import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { getRecordShowParamsFromPath } from '@/side-panel/routing/utils/getRecordShowParamsFromPath';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';

// A record expands through its own hook rather than the generic routed one,
// because it also carries the open tab across and clears a stale parent view.
export const useExpandRecordSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();

    const currentRoutedPath = useCurrentSidePanelRoutedPath();

    const { navigateToRecordPage } = useNavigateToRecordPageFromSidePanel();

    const recordShowParams = isDefined(currentRoutedPath)
      ? getRecordShowParamsFromPath(currentRoutedPath)
      : null;

    if (!isDefined(recordShowParams)) {
      return null;
    }

    return {
      label: t`Expand record`,
      hasExpandShortcut: true,
      expand: () =>
        navigateToRecordPage({
          objectNameSingular: recordShowParams.objectNameSingular,
          recordId: recordShowParams.objectRecordId,
        }),
    };
  };
