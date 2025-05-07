import { ActionDisplay } from '@/action-menu/actions/display/components/ActionDisplay';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { IconComponent } from 'twenty-ui/display';

export const ActionOpenSidePanelPage = ({
  page,
  pageTitle,
  pageIcon,
  onClick,
  shouldResetSearchState = false,
}: {
  page: CommandMenuPages;
  pageTitle: string;
  pageIcon: IconComponent;
  onClick?: () => void;
  shouldResetSearchState?: boolean;
}) => {
  const actionConfig = useContext(ActionConfigContext);

  const { navigateCommandMenu } = useNavigateCommandMenu();

  const setCommandMenuSearchState = useSetRecoilState(commandMenuSearchState);

  if (!actionConfig) {
    return null;
  }

  const handleClick = () => {
    onClick?.();

    navigateCommandMenu({
      page,
      pageTitle,
      pageIcon,
    });

    if (shouldResetSearchState) {
      setCommandMenuSearchState('');
    }
  };

  return <ActionDisplay onClick={handleClick} />;
};
