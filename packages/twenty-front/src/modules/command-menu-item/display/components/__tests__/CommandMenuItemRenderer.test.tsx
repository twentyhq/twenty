import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuItemRenderer } from '@/command-menu-item/display/components/CommandMenuItemRenderer';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { render, screen } from '@testing-library/react';
import {
  CommandMenuItemAvailabilityType,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

jest.mock(
  '@/command-menu-item/display/hooks/useCommandMenuItemDisplay',
  () => ({
    useCommandMenuItemDisplay: (item: CommandMenuItemDefinition) => ({
      Icon: () => null,
      label: item.label,
      shortLabel: item.shortLabel,
      handleClick: jest.fn(),
      disabled: false,
      progress: undefined,
      isLoading: false,
    }),
  }),
);

jest.mock('@/applications/hooks/useIsThirdPartyApplication', () => ({
  useIsThirdPartyApplication: () => false,
}));

const buildNavigationItem = ({
  label,
  path,
  engineComponentKey = EngineComponentKey.NAVIGATION,
}: {
  label: string;
  path: string;
  engineComponentKey?: EngineComponentKey;
}): CommandMenuItemDefinition => ({
  __typename: 'CommandMenuItem',
  universalIdentifier: null,
  applicationId: null,
  coreWorkflowVersionId: null,
  conditionalPinnedExpression: null,
  navigationTargetObjectMetadataId: null,
  pageLayoutId: null,
  id: 'command-menu-item',
  workflowVersionId: null,
  frontComponentId: null,
  frontComponent: null,
  engineComponentKey,
  label,
  icon: null,
  shortLabel: null,
  position: 0,
  isPinned: false,
  hotKeys: null,
  conditionalAvailabilityExpression: null,
  availabilityType: CommandMenuItemAvailabilityType.GLOBAL,
  availabilityObjectMetadataId: null,
  availabilityCoreObjectName: null,
  payload: { __typename: 'PathCommandMenuItemPayload', path },
  isActive: true,
});

const renderListItem = (item: CommandMenuItemDefinition) =>
  render(
    <CommandMenuContext.Provider
      value={{
        displayType: 'listItem',
        containerType: CommandMenuItemContainerType.CommandMenuList,
        commandMenuItems: [item],
        commandMenuContextApi: EMPTY_COMMAND_MENU_CONTEXT_API,
        isInPreviewMode: false,
      }}
    >
      <SelectableListComponentInstanceContext.Provider
        value={{ instanceId: 'command-menu-item-renderer-test' }}
      >
        <CommandMenuItemRenderer item={item} />
      </SelectableListComponentInstanceContext.Provider>
    </CommandMenuContext.Provider>,
  );

describe('CommandMenuItemRenderer', () => {
  it('shows Settings as the subtitle of a settings sub-page Go to command', () => {
    renderListItem(
      buildNavigationItem({
        label: 'Go to Experience',
        path: '/settings/experience',
      }),
    );

    expect(screen.getByText('Go to Experience')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it.each([
    {
      variant: 'the settings root',
      label: 'Go to Settings',
      path: '/settings/profile',
    },
    { variant: 'a non-settings page', label: 'Go to Agents', path: '/agents' },
  ])('shows no subtitle for $variant', ({ label, path }) => {
    renderListItem(buildNavigationItem({ label, path }));

    expect(screen.getByText(label)).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });
});
