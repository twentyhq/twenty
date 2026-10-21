import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderWithWorkflowEnrichment } from '@/command-menu-item/contexts/CommandMenuContextProviderWithWorkflowEnrichment';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  EngineComponentKey,
  CommandMenuItemAvailabilityType,
} from '~/generated-metadata/graphql';

jest.mock(
  '@/command-menu-item/hooks/useGlobalRecordCreationCommandMenuItems',
  () => ({
    useGlobalRecordCreationCommandMenuItems: () => ({
      hasGlobalRecordCreationCommandTemplate: false,
      globalRecordCreationCommandMenuItems: [],
    }),
  }),
);
jest.mock('@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions');
jest.mock(
  '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage',
  () => ({
    useIsLayoutCustomizationAllowedOnCurrentPage: () => false,
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
jest.mock('@/auth/states/currentWorkspaceState', () => ({
  currentWorkspaceState: {},
}));
jest.mock('@/command-menu-item/states/commandMenuItemsSelector', () => ({
  commandMenuItemsSelector: {},
}));
jest.mock('@/command-menu-item/edit/states/commandMenuItemsDraftState', () => ({
  commandMenuItemsDraftState: {},
}));
jest.mock('@/page-layout/states/currentPageLayoutIdState', () => ({
  currentPageLayoutIdState: {},
  PageLayoutIdContext: jest.requireActual('react').createContext(undefined),
}));

const REQUIRES_UPDATE =
  'noneEquals(selectedRecords, "recordPermissions.canUpdate", false)';
const REQUIRES_SOFT_DELETE =
  'noneEquals(selectedRecords, "recordPermissions.canSoftDelete", false)';

const COMMANDS = (
  [
    [EngineComponentKey.TEST_WORKFLOW, 'Test workflow', null],
    [EngineComponentKey.DUPLICATE_WORKFLOW, 'Duplicate', REQUIRES_UPDATE],
    [EngineComponentKey.DEACTIVATE_WORKFLOW, 'Deactivate', REQUIRES_UPDATE],
    [EngineComponentKey.TIDY_UP_WORKFLOW, 'Tidy up', REQUIRES_UPDATE],
    [EngineComponentKey.DELETE_RECORDS, 'Delete', REQUIRES_SOFT_DELETE],
  ] as const
).map(([engineComponentKey, label, expression], position) => ({
  id: engineComponentKey,
  engineComponentKey,
  label,
  position,
  isPinned: true,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
  conditionalAvailabilityExpression: expression,
})) as CommandMenuItemDefinition[];

const CURRENT_WORKSPACE = {
  workspaceCustomApplication: { id: 'workspace-application' },
  installedApplications: [
    { id: 'workspace-application', universalIdentifier: 'workspace' },
    { id: 'installed-application', universalIdentifier: 'installed' },
  ],
};

const CommandButtons = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems.map((command) => (
    <button key={command.id}>{command.label}</button>
  ));
};

const renderWorkflowCommands = (applicationId: string) => {
  jest.mocked(useAtomStateValue).mockImplementation((state) => {
    if (state === commandMenuItemsSelector) {
      return COMMANDS;
    }

    return state === currentWorkspaceState ? CURRENT_WORKSPACE : null;
  });
  jest.mocked(useCoreWorkflowsWithCurrentVersions).mockReturnValue([
    {
      __typename: 'Workflow',
      id: 'workflow',
      name: 'Workflow',
      applicationId,
      statuses: ['ACTIVE'],
      lastPublishedVersionId: 'version',
      versions: [],
      currentVersion: {
        __typename: 'WorkflowVersion',
        id: 'version',
        name: 'v1',
        status: 'ACTIVE',
        trigger: null,
        steps: [],
        workflowId: 'workflow',
        createdAt: '2026-09-30T00:00:00.000Z',
        updatedAt: '2026-09-30T00:00:00.000Z',
      },
    },
  ] as unknown as ReturnType<typeof useCoreWorkflowsWithCurrentVersions>);

  return render(
    <CommandMenuContextProviderWithWorkflowEnrichment
      displayType="button"
      containerType={CommandMenuItemContainerType.ShowPageHeader}
      isInPreviewMode={false}
      selectedWorkflowRecordIds={['workflow']}
      commandMenuContextApi={{
        ...EMPTY_COMMAND_MENU_CONTEXT_API,
        pageType: ContextStorePageType.Record,
        numberOfSelectedRecords: 1,
        selectedRecords: [{ id: 'workflow' }],
        objectMetadataItem: { nameSingular: CoreObjectNameSingular.Workflow },
      }}
    >
      <CommandButtons />
    </CommandMenuContextProviderWithWorkflowEnrichment>,
  );
};

describe('workflow command availability', () => {
  it('hides commands that change or delete a workflow installed by an application', () => {
    renderWorkflowCommands('installed-application');

    expect(screen.getByRole('button', { name: 'Test workflow' })).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Duplicate' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Deactivate' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Tidy up' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('keeps every command on a workspace workflow', () => {
    renderWorkflowCommands('workspace-application');

    expect(screen.getByRole('button', { name: 'Test workflow' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tidy up' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
