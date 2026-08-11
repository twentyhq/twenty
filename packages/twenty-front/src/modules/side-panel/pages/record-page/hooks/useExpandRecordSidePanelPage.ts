import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { viewableRecordIdComponentState } from '@/side-panel/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/side-panel/pages/record-page/states/viewableRecordNameSingularComponentState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';

export const useExpandRecordSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();

    const viewableRecordId = useAtomComponentStateValue(
      viewableRecordIdComponentState,
    );

    const viewableRecordNameSingular = useAtomComponentStateValue(
      viewableRecordNameSingularComponentState,
    );

    const { navigateToRecordPage } = useNavigateToRecordPageFromSidePanel();

    if (
      !isDefined(viewableRecordId) ||
      !isDefined(viewableRecordNameSingular)
    ) {
      return null;
    }

    return {
      label: t`Expand record`,
      hasExpandShortcut: true,
      expand: () =>
        navigateToRecordPage({
          objectNameSingular: viewableRecordNameSingular,
          recordId: viewableRecordId,
        }),
    };
  };
