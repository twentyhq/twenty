import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsObjectFieldItemTableRow } from '@/settings/data-model/object-details/components/SettingsObjectFieldItemTableRow';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockDeleteOneFieldMetadataItem = jest.fn();

jest.mock('@/object-metadata/hooks/useDeleteOneFieldMetadataItem', () => ({
  useDeleteOneFieldMetadataItem: () => ({
    deleteOneFieldMetadataItem: mockDeleteOneFieldMetadataItem,
  }),
}));

jest.mock('@/object-metadata/hooks/useFieldMetadataItem', () => ({
  useFieldMetadataItem: () => ({
    activateMetadataField: jest.fn(),
  }),
}));

jest.mock('~/hooks/useNavigateSettings', () => ({
  useNavigateSettings: () => jest.fn(),
}));

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const DEACTIVATED_CUSTOM_FIELD_METADATA_ITEM = {
  ...getMockFieldMetadataItemOrThrow({
    objectMetadataItem: companyObjectMetadataItem,
    fieldName: 'tagline',
  }),
  id: 'deactivated-custom-field-id',
  name: 'qaTempField',
  label: 'QA Temp Field',
  type: FieldMetadataType.TEXT,
  isActive: false,
  isSystem: false,
  applicationId: mockCurrentWorkspace.workspaceCustomApplication.id,
};

const renderFieldRow = () => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);

  return render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <MemoryRouter>
          <SettingsObjectFieldItemTableRow
            settingsObjectDetailTableItem={{
              fieldMetadataItem: DEACTIVATED_CUSTOM_FIELD_METADATA_ITEM,
              objectMetadataItem: companyObjectMetadataItem,
              fieldType: FieldMetadataType.TEXT,
              label: DEACTIVATED_CUSTOM_FIELD_METADATA_ITEM.label,
              dataType: FieldMetadataType.TEXT,
            }}
            status="disabled"
            mode="view"
          />
        </MemoryRouter>
      </I18nProvider>
    </JotaiProvider>,
  );
};

describe('SettingsObjectFieldItemTableRow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('asks for confirmation before deleting a deactivated field from the row menu', async () => {
    const user = userEvent.setup();

    renderFieldRow();

    await user.click(
      screen.getByRole('button', { name: 'Inactive Field Options' }),
    );
    await user.click(await screen.findByRole('menuitem', { name: 'Delete' }));

    expect(
      await screen.findByText('Delete QA Temp Field field?'),
    ).toBeInTheDocument();
    expect(mockDeleteOneFieldMetadataItem).not.toHaveBeenCalled();

    await user.type(screen.getByPlaceholderText('yes'), 'yes');
    await user.click(screen.getByTestId('confirmation-modal-confirm-button'));

    expect(mockDeleteOneFieldMetadataItem).toHaveBeenCalledWith({
      idToDelete: DEACTIVATED_CUSTOM_FIELD_METADATA_ITEM.id,
    });
  });
});
