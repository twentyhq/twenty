import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { type SidePanelPages } from 'twenty-shared/types';
import { type IconComponent } from 'twenty-ui/display';

export const ActionOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  onClick,
  shouldResetSearchState = false,
}: {
  page: SidePanelPages;
  pageTitle: MessageDescriptor;
  pageIcon: IconComponent;
  onClick?: () => void;
  shouldResetSearchState?: boolean;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { navigateSidePanel } = useNavigateSidePanel();

  const setSidePanelSearch = useSetAtomState(sidePanelSearchState);

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    onClick?.();

    navigateSidePanel({
      page,
      pageTitle: t(pageTitle),
      pageIcon,
    });

    if (shouldResetSearchState) {
      setSidePanelSearch('');
    }
  };

  return <ActionDisplay onClick={handleClick} />;
};
