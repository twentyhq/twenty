import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { viewableRichTextComponentState } from '@/side-panel/pages/rich-text-page/states/viewableRichTextComponentState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useExpandRichTextSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();

    const { recordId, objectNameSingular } = useAtomStateValue(
      viewableRichTextComponentState,
    );

    const { navigateToRecordPage } = useNavigateToRecordPageFromSidePanel();

    if (!isNonEmptyString(recordId) || !isNonEmptyString(objectNameSingular)) {
      return null;
    }

    return {
      label: t`Expand record`,
      hasExpandShortcut: true,
      expand: () => navigateToRecordPage({ objectNameSingular, recordId }),
    };
  };
