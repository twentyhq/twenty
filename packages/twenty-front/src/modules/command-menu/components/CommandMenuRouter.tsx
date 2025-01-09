import { CommandMenuContainer } from '@/command-menu/components/CommandMenuContainer';
import { CommandMenuTopBar } from '@/command-menu/components/CommandMenuTopBar';
import { COMMAND_MENU_PAGES_CONFIG } from '@/command-menu/constants/CommandMenuPagesConfig';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const CommandMenuRouter = () => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);

  const commandMenuPageComponent = isDefined(commandMenuPage) ? (
    COMMAND_MENU_PAGES_CONFIG.get(commandMenuPage)
  ) : (
    <></>
  );

  return (
    <CommandMenuContainer>
      <CommandMenuTopBar />
      {commandMenuPageComponent}
    </CommandMenuContainer>
  );
};
