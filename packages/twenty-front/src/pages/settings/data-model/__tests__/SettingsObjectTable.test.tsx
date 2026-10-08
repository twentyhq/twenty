import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { SettingsObjectTable } from '~/pages/settings/data-model/SettingsObjectTable';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockDeleteOneObjectMetadataItem = jest.fn();

jest.mock('@/object-metadata/hooks/useDeleteOneObjectMetadataItem', () => ({
  useDeleteOneObjectMetadataItem: () => ({
    deleteOneObjectMetadataItem: mockDeleteOneObjectMetadataItem,
  }),
}));

jest.mock('@/object-metadata/hooks/useUpdateOneObjectMetadataItem', () => ({
  useUpdateOneObjectMetadataItem: () => ({
    updateOneObjectMetadataItem: jest.fn(),
  }),
}));

jest.mock(
  '@/object-record/multiple-objects/hooks/useCombinedGetTotalCount',
  () => ({
    useCombinedGetTotalCount: () => ({
      totalCountByObjectMetadataItemNamePlural: {},
    }),
  }),
);

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

const DEACTIVATED_CUSTOM_OBJECT_METADATA_ITEM = {
  ...getMockObjectMetadataItemOrThrow('company'),
  id: 'deactivated-custom-object-id',
  nameSingular: 'qaTemp',
  namePlural: 'qaTemps',
  labelSingular: 'QA Temp',
  labelPlural: 'QA Temps',
  isActive: false,
  isSystem: false,
  applicationId: mockCurrentWorkspace.workspaceCustomApplication.id,
};

const renderSettingsObjectTable = () => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsObjectTable
            objectMetadataItems={[DEACTIVATED_CUSTOM_OBJECT_METADATA_ITEM]}
          />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );
};

const openDeleteFromRowMenu = async (
  user: ReturnType<typeof userEvent.setup>,
) => {
  await user.click(
    screen.getByRole('button', { name: 'Inactive Object Options' }),
  );
  await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));
};

describe('SettingsObjectTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks for confirmation before deleting a deactivated object from the row menu', async () => {
    const user = userEvent.setup();

    renderSettingsObjectTable();

    await openDeleteFromRowMenu(user);

    expect(
      await screen.findByText('Delete QA Temps object?'),
    ).toBeInTheDocument();
    expect(mockDeleteOneObjectMetadataItem).not.toHaveBeenCalled();

    const confirmButton = screen.getByTestId(
      'confirmation-modal-confirm-button',
    );

    expect(confirmButton).toBeDisabled();

    await user.type(screen.getByPlaceholderText('yes'), 'yes');
    await user.click(confirmButton);

    expect(mockDeleteOneObjectMetadataItem).toHaveBeenCalledWith(
      DEACTIVATED_CUSTOM_OBJECT_METADATA_ITEM.id,
    );
  });

  it('does not delete the object when the confirmation is cancelled', async () => {
    const user = userEvent.setup();

    renderSettingsObjectTable();

    await openDeleteFromRowMenu(user);

    await user.click(
      await screen.findByTestId('confirmation-modal-cancel-button'),
    );

    expect(mockDeleteOneObjectMetadataItem).not.toHaveBeenCalled();
  });
});
