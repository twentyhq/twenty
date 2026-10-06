import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { AppPath } from 'twenty-shared/types';

import { CommandMenuConfirmationModalManager } from '@/command-menu-item/confirmation-modal/components/CommandMenuConfirmationModalManager';
import { CommandComponentInstanceContext } from '@/command-menu-item/engine-command/states/contexts/CommandComponentInstanceContext';
import { DeleteCoreWorkflowsCommand } from '@/object-core/workflows/components/DeleteCoreWorkflowsCommand';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

const mockDeleteSelectedCoreWorkflows = jest.fn();
const mockNavigate = jest.fn();
const mockCloseSidePanelMenu = jest.fn();
let mockSelectedRecords: { id: string }[] = [];

jest.mock(
  '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi',
  () => ({
    useHeadlessCommandContextApi: () => ({
      selectedRecords: mockSelectedRecords,
    }),
  }),
);

jest.mock(
  '@/object-core/workflows/hooks/useDeleteSelectedCoreWorkflows',
  () => ({
    useDeleteSelectedCoreWorkflows: () => ({
      deleteSelectedCoreWorkflows: mockDeleteSelectedCoreWorkflows,
    }),
  }),
);

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => mockNavigate,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: mockCloseSidePanelMenu }),
}));

const renderCommand = () => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({ apolloMocks: [] });

  return render(
    <>
      <DeleteCoreWorkflowsCommand />
      <CommandMenuConfirmationModalManager />
    </>,
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <Wrapper>
          <I18nProvider i18n={i18n}>
            <CommandComponentInstanceContext.Provider
              value={{ instanceId: 'delete-core-workflows-command' }}
            >
              {children}
            </CommandComponentInstanceContext.Provider>
          </I18nProvider>
        </Wrapper>
      ),
    },
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSelectedRecords = [{ id: 'workflow-1' }];
  mockDeleteSelectedCoreWorkflows.mockResolvedValue(true);
});

it('asks for confirmation before deleting a single workflow', async () => {
  renderCommand();

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
});

it('shows the selected workflow count when deleting several workflows', async () => {
  mockSelectedRecords = [
    { id: 'workflow-1' },
    { id: 'workflow-2' },
    { id: 'workflow-3' },
  ];

  renderCommand();

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

it('deletes nothing and stays on the page when cancelled', async () => {
  renderCommand();

  await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));

  await waitFor(() =>
    expect(screen.queryByText('Delete workflow?')).not.toBeInTheDocument(),
  );
  expect(mockDeleteSelectedCoreWorkflows).not.toHaveBeenCalled();
  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});

it('deletes the selected workflows and goes back to the index once confirmed', async () => {
  mockSelectedRecords = [{ id: 'workflow-1' }, { id: 'workflow-2' }];

  renderCommand();

  await userEvent.click(
    await screen.findByRole('button', { name: 'Delete workflows' }),
  );

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith(AppPath.RecordIndexPage, {
      objectNamePlural: 'workflows',
    }),
  );
  expect(mockDeleteSelectedCoreWorkflows).toHaveBeenCalledWith([
    'workflow-1',
    'workflow-2',
  ]);
  expect(mockCloseSidePanelMenu).toHaveBeenCalled();
});

it('stays on the page when the deletion fails', async () => {
  mockDeleteSelectedCoreWorkflows.mockResolvedValue(false);

  renderCommand();

  await userEvent.click(
    await screen.findByRole('button', { name: 'Delete workflow' }),
  );

  await waitFor(() =>
    expect(mockDeleteSelectedCoreWorkflows).toHaveBeenCalledWith([
      'workflow-1',
    ]),
  );
  expect(mockCloseSidePanelMenu).not.toHaveBeenCalled();
  expect(mockNavigate).not.toHaveBeenCalled();
});
