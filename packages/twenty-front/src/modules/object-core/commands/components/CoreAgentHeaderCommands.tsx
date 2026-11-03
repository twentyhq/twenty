import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CoreAgentCommandContextProvider } from '@/object-core/commands/components/CoreAgentCommandContextProvider';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAtomValue } from 'jotai';
import { useContext } from 'react';
import { EngineComponentKey } from '~/generated-metadata/graphql';

const CoreAgentPinnedButtons = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);
  return commandMenuItems
    .filter(
      (item) =>
        item.isPinned && item.engineComponentKey === EngineComponentKey.ASK_AI,
    )
    .map((item) => (
      <CommandMenuItemRenderer key={item.id} item={item} shouldHideLabel />
    ));
};

type CoreAgentHeaderCommandsProps = { view: 'index' | 'record' };

export const CoreAgentHeaderCommands = ({
  view,
}: CoreAgentHeaderCommandsProps) => {
  const instanceId = useWorkspaceSurfaceScopedComponentInstanceId(
    `core-agent-${view}-header`,
  );
  const workspaceSurface = useWorkspaceSurface();
  const isLayoutCustomizationModeEnabled = useAtomValue(
    isLayoutCustomizationModeEnabledState.atom,
  );
  return (
    <CommandMenuComponentInstanceContext.Provider value={{ instanceId }}>
      <CoreAgentCommandContextProvider
        displayType="button"
        containerType={
          view === 'index'
            ? CommandMenuItemContainerType.IndexPageHeader
            : CommandMenuItemContainerType.ShowPageHeader
        }
        isInPreviewMode={
          isLayoutCustomizationModeEnabled && workspaceSurface.type === 'main'
        }
      >
        <CoreAgentPinnedButtons />
      </CoreAgentCommandContextProvider>
    </CommandMenuComponentInstanceContext.Provider>
  );
};
