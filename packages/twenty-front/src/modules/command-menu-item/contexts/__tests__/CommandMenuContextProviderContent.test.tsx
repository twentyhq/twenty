import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';

import { EMPTY_COMMAND_MENU_CONTEXT_API } from '@/command-menu-item/constants/EmptyCommandMenuContextApi';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProviderContent } from '@/command-menu-item/contexts/CommandMenuContextProviderContent';
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
jest.mock('@/workflow/hooks/useIsWorkflowCoreEnabled', () => ({
  useIsWorkflowCoreEnabled: () => true,
}));
jest.mock(
  '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage',
  () => ({
    useIsLayoutCustomizationAllowedOnCurrentPage: () => false,
  }),
);
jest.mock('@/ui/utilities/state/jotai/hooks/useAtomStateValue');
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

const COMMANDS = [
  [EngineComponentKey.TEST_WORKFLOW, 'Test workflow'],
  [EngineComponentKey.SEE_RUNS_WORKFLOW, 'See runs'],
  [EngineComponentKey.DUPLICATE_WORKFLOW, 'Duplicate'],
  [EngineComponentKey.DEACTIVATE_WORKFLOW, 'Deactivate'],
  [EngineComponentKey.TIDY_UP_WORKFLOW, 'Tidy up'],
  [EngineComponentKey.DELETE_RECORDS, 'Delete'],
].map(([engineComponentKey, label], position) => ({
  id: engineComponentKey,
  engineComponentKey,
  label,
  position,
  isPinned: true,
  availabilityType: CommandMenuItemAvailabilityType.RECORD_SELECTION,
})) as CommandMenuItemDefinition[];

const CommandButtons = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);

  return commandMenuItems.map((command) => (
    <button key={command.id}>{command.label}</button>
  ));
};

const renderCommands = (isWorkflowDefinitionReadOnly: boolean) => {
  jest
    .mocked(useAtomStateValue)
    .mockImplementation((state) =>
      state === commandMenuItemsSelector ? COMMANDS : null,
    );

  return render(
    <CommandMenuContextProviderContent
      displayType="button"
      containerType={CommandMenuItemContainerType.ShowPageHeader}
      isInPreviewMode={false}
      isWorkflowDefinitionReadOnly={isWorkflowDefinitionReadOnly}
      commandMenuContextApi={{
        ...EMPTY_COMMAND_MENU_CONTEXT_API,
        pageType: ContextStorePageType.Record,
        numberOfSelectedRecords: 1,
        selectedRecords: [{ id: 'workflow' }],
        objectMetadataItem: { nameSingular: CoreObjectNameSingular.Workflow },
      }}
    >
      <CommandButtons />
    </CommandMenuContextProviderContent>,
  );
};

describe('application workflow commands', () => {
  it('keeps test and runs commands while hiding unsupported application workflow commands', () => {
    renderCommands(true);

    expect(screen.getByRole('button', { name: 'Test workflow' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'See runs' })).toBeVisible();
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

  it('keeps definition commands available for editable workflows', () => {
    renderCommands(false);

    expect(screen.getByRole('button', { name: 'Duplicate' })).toBeVisible();

    expect(screen.getByRole('button', { name: 'Test workflow' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Tidy up' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeVisible();
  });
});
