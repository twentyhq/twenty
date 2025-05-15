import { useContext, useState } from 'react';

import { TRANSFER_CHAT_OPTIONS_DROPDOWN_ID } from '@/chat/call-center/components/TransferChatOptionsDropdown';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
// eslint-disable-next-line no-restricted-imports
import { TransferChatOption } from '@/chat/call-center/components/TransferChatOption';
import { IconChevronLeft, IconIdBadge2, IconUsers } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type TransferChatOptionsMenu = 'agents' | 'sectors';

export const TransferChatOptionsDropdownContent = () => {
  const { transferService, workspaceAgents } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;
  const { closeDropdown } = useDropdown(TRANSFER_CHAT_OPTIONS_DROPDOWN_ID);

  const [currentMenu, setCurrentMenu] = useState<
    TransferChatOptionsMenu | undefined
  >(undefined);

  const { sectors } = useFindAllSectors();

  const resetMenu = () => setCurrentMenu(undefined);

  const handleSelectMenu = (option: TransferChatOptionsMenu) => {
    setCurrentMenu(option);
  };

  return (
    <>
      {!currentMenu && (
        <DropdownMenuItemsContainer>
          <MenuItem
            onClick={() => handleSelectMenu('sectors')}
            LeftIcon={IconIdBadge2}
            text="Sectors"
            hasSubMenu
          />
          <MenuItem
            onClick={() => handleSelectMenu('agents')}
            LeftIcon={IconUsers}
            text="Agents"
            hasSubMenu
          />
        </DropdownMenuItemsContainer>
      )}
      {currentMenu === 'agents' && (
        <>
          <DropdownMenuHeader
            StartComponent={<IconChevronLeft />}
            onClick={resetMenu}
          >
            Agents
          </DropdownMenuHeader>
          {workspaceAgents.map((agent: any) => (
            <TransferChatOption
              key={agent.agentId}
              hasAvatar={true}
              agent={agent}
              onClick={() => {
                transferService(agent, undefined);
                closeDropdown();
              }}
            />
          ))}
        </>
      )}
      {currentMenu === 'sectors' && (
        <>
          <DropdownMenuHeader
            StartComponent={<IconChevronLeft />}
            onClick={resetMenu}
          >
            Sectors
          </DropdownMenuHeader>
          {sectors.map((sector) => (
            <TransferChatOption
              key={sector.id}
              text={sector.name}
              LeftIcon={sector.icon}
              onClick={() => {
                transferService(undefined, sector);
                closeDropdown();
              }}
            />
          ))}
        </>
      )}
    </>
  );
};
