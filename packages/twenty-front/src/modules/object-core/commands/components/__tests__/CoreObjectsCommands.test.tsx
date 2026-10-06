import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

import { CoreObjectsCommands } from '@/object-core/commands/components/CoreObjectsCommands';
import { SelectableList } from '@/ui/layout/selectable-list/components/SelectableList';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockDeleteSelectedCoreWorkflows = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
let mockSelectedCoreWorkflowIds: string[] = [];

jest.mock('@/object-core/commands/hooks/useCoreObjectsCommands', () => ({
  useCoreObjectsCommands: () => ({
    coreWorkflowFiltersCommandLabel: 'Filter workflows',
    shouldDisplayCoreWorkflowFiltersCommand: false,
    coreWorkflowsDeleteCommandLabel: 'Delete Workflows',
    shouldDisplayCoreWorkflowsDeleteCommand: true,
  }),
}));

jest.mock(
  '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows',
  () => ({
    useDeleteSelectedCoreWorkflows: () => ({
      deleteSelectedCoreWorkflows: mockDeleteSelectedCoreWorkflows,
      selectedCoreWorkflowIds: mockSelectedCoreWorkflowIds,
    }),
  }),
);

jest.mock(
  '@/object-core/workflows/hooks/useOpenCoreWorkflowFiltersSidePanel',
  () => ({
    useOpenCoreWorkflowFiltersSidePanel: () => ({
      openCoreWorkflowFiltersSidePanel: jest.fn(),
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

const renderSelectionCommands = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(<CoreObjectsCommands section="SELECTION" />, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Wrapper>
        <I18nProvider i18n={i18n}>
          <MemoryRouter>
            <SelectableList
              selectableListInstanceId="core-objects-commands-test"
              selectableItemIdArray={[]}
              focusId="core-objects-commands-test"
            >
              {children}
            </SelectableList>
          </MemoryRouter>
        </I18nProvider>
      </Wrapper>
    ),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectedCoreWorkflowIds = ['workflow-1'];
  mockDeleteSelectedCoreWorkflows.mockResolvedValue(true);
});

it('asks for confirmation before deleting the selected workflow', async () => {
  renderSelectionCommands();

  await userEvent.click(screen.getByText('Delete Workflows'));

  expect(await screen.findByText('Delete workflow?')).toBeInTheDocument();
  expect(
    screen.getByText(
      'This permanently deletes this workflow and all its run history. This action cannot be undone.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Delete workflow' }),
  ).toBeInTheDocument();
  expect(mockDeleteSelectedCoreWorkflows).not.toHaveBeenCalled();
  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
});

it('shows the selected workflow count when several workflows are selected', async () => {
  mockSelectedCoreWorkflowIds = ['workflow-1', 'workflow-2', 'workflow-3'];

  renderSelectionCommands();

  await userEvent.click(screen.getByText('Delete Workflows'));

  expect(await screen.findByText('Delete 3 workflows?')).toBeInTheDocument();
  expect(
    screen.getByText(
      'This permanently deletes these 3 workflows and all their run history. This action cannot be undone.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Delete workflows' }),
  ).toBeInTheDocument();
});

it('deletes nothing and keeps the side panel open when cancelled', async () => {
  renderSelectionCommands();

  await userEvent.click(screen.getByText('Delete Workflows'));
  await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

  await waitFor(() =>
    expect(screen.queryByText('Delete workflow?')).not.toBeInTheDocument(),
  );
  expect(mockDeleteSelectedCoreWorkflows).not.toHaveBeenCalled();
  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
});

it('closes the side panel and deletes the selection once confirmed', async () => {
  mockSelectedCoreWorkflowIds = ['workflow-1', 'workflow-2'];

  renderSelectionCommands();

  await userEvent.click(screen.getByText('Delete Workflows'));
  await userEvent.click(
    await screen.findByRole('button', { name: 'Delete workflows' }),
  );

  expect(mockCloseSidePanelMenu).toHaveBeenCalled();
  expect(mockDeleteSelectedCoreWorkflows).toHaveBeenCalledTimes(1);
});
