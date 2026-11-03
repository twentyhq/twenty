import { type CommandMenuContextType } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderContent } from '@/command-menu-item/contexts/CommandMenuContextProviderContent';
import { useCurrentCommandMenuContextApi } from '@/command-menu-item/hooks/useCurrentCommandMenuContextApi';
import { getCoreAgentCommandContextApi } from '@/object-core/commands/utils/getCoreAgentCommandContextApi';
import { PageLayoutIdContext } from '@/page-layout/states/currentPageLayoutIdState';
import { type ReactNode } from 'react';

type CoreAgentCommandContextProviderProps = {
  displayType: CommandMenuContextType['displayType'];
  containerType: CommandMenuContextType['containerType'];
  isInPreviewMode: boolean;
  children: ReactNode;
};

export const CoreAgentCommandContextProvider = ({
  displayType,
  containerType,
  isInPreviewMode,
  children,
}: CoreAgentCommandContextProviderProps) => {
  const context = useCurrentCommandMenuContextApi();
  return (
    <PageLayoutIdContext.Provider value={null}>
      <CommandMenuContextProviderContent
        displayType={displayType}
        containerType={containerType}
        isInPreviewMode={isInPreviewMode}
        commandMenuContextApi={getCoreAgentCommandContextApi(context)}
      >
        {children}
      </CommandMenuContextProviderContent>
    </PageLayoutIdContext.Provider>
  );
};
