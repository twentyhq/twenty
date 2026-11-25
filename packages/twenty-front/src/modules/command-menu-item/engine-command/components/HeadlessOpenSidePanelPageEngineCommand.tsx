import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { type NonPageLayoutPurposeBuiltSidePanelPage } from '@/side-panel/types/SidePanelPage';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';
import { useLingui } from '@lingui/react/macro';

export const HeadlessOpenSidePanelPageEngineCommand = ({
  page,
  pageTitle,
  pageIcon,
  shouldResetSearchState = false,
  shouldResetSearchObjectFilter = false,
}: {
  page: NonPageLayoutPurposeBuiltSidePanelPage;
  pageTitle: MessageDescriptor;
  pageIcon: IconComponent;
  shouldResetSearchState?: boolean;
  shouldResetSearchObjectFilter?: boolean;
}) => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);
  const setSidePanelSearchObjectFilter = useSetAtomState(
    sidePanelSearchObjectFilterState,
  );

  const onExecute = () => {
    if (shouldResetSearchObjectFilter) {
      setSidePanelSearchObjectFilter(null);
    }

    navigateSidePanel({
      page,
      pageTitle: t(pageTitle),
      pageIcon,
    });

    if (shouldResetSearchState) {
      setSidePanelSearch('');
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
