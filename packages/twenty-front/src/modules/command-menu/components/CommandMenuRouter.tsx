import { ActionMenuContextProvider } from '@/action-menu/contexts/ActionMenuContextProvider';
import { CommandMenuContainer } from '@/command-menu/components/CommandMenuContainer';
import { CommandMenuContextChipRecordSetterEffect } from '@/command-menu/components/CommandMenuContextChipRecordSetterEffect';
import { CommandMenuTopBar } from '@/command-menu/components/CommandMenuTopBar';
import { COMMAND_MENU_PAGES_CONFIG } from '@/command-menu/constants/CommandMenuPagesConfig';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { CommandMenuPageComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuPageComponentInstanceContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { SettingsPath } from '@/types/SettingsPath';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

const StyledCommandMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export const CommandMenuRouter = () => {
  const commandMenuPage = useRecoilValue(commandMenuPageState);
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const location = useLocation();
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  const commandMenuPageComponent = isDefined(commandMenuPage) ? (
    COMMAND_MENU_PAGES_CONFIG.get(commandMenuPage)
  ) : (
    <></>
  );

  const theme = useTheme();

  const isSettingsPage = location.pathname.includes(SettingsPath.PageLayout);
  const objectMetadataItemOverride = isSettingsPage
    ? objectMetadataItems.find(
        (item) => item.nameSingular === CoreObjectNameSingular.Dashboard,
      )
    : undefined;

  return (
    <CommandMenuContainer>
      <CommandMenuContextChipRecordSetterEffect />
      <CommandMenuPageComponentInstanceContext.Provider
        value={{ instanceId: commandMenuPageInfo.instanceId }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: theme.animation.duration.instant,
            delay: 0.1,
          }}
        >
          <CommandMenuTopBar />
        </motion.div>
        <StyledCommandMenuContent>
          <ActionMenuContextProvider
            isInRightDrawer={true}
            displayType="listItem"
            actionMenuType="command-menu"
            objectMetadataItemOverride={objectMetadataItemOverride}
          >
            {commandMenuPageComponent}
          </ActionMenuContextProvider>
        </StyledCommandMenuContent>
      </CommandMenuPageComponentInstanceContext.Provider>
    </CommandMenuContainer>
  );
};
