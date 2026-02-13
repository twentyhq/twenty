import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { useOpenAskAIPageInCommandMenu } from '@/command-menu/hooks/useOpenAskAIPageInCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { type MessageDescriptor } from '@lingui/core';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { type IconComponent } from 'twenty-ui/display';

export const ActionOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  onClick,
  shouldResetSearchState = false,
}: {
  page: CommandMenuPages;
  pageTitle: MessageDescriptor;
  pageIcon: IconComponent;
  onClick?: () => void;
  shouldResetSearchState?: boolean;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { openAskAIPage } = useOpenAskAIPageInCommandMenu();

  const setCommandMenuSearchState = useSetRecoilState(commandMenuSearchState);

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    onClick?.();

    if (page === CommandMenuPages.AskAI) {
      openAskAIPage({ resetNavigationStack: false });
    } else {
      navigateCommandMenu({
        page,
        pageTitle: t(pageTitle),
        pageIcon,
      });
    }

    if (shouldResetSearchState) {
      setCommandMenuSearchState('');
    }
  };

  return <ActionDisplay onClick={handleClick} />;
};
