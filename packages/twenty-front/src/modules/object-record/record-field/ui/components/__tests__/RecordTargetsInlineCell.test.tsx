import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

import { FileUploadProvider } from '@/file-upload/components/FileUploadProvider';
import { RecordTargetsInlineCell } from '@/object-record/record-field/ui/components/RecordTargetsInlineCell';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

// Opening the picker performs a record search over the network, which is out of
// scope here and unreachable through MockedProvider.
jest.mock(
  '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch',
  () => ({
    useMultipleRecordPickerPerformSearch: () => ({
      performSearch: jest.fn(),
    }),
  }),
);

const NOTE_ID = '20202020-0000-4000-8000-000000000001';

const renderCell = (objectNameSingular: string) => {
  const Wrapper = getJestMetadataAndApolloMocksWrapper({
    onInitializeJotaiStore: (store) => {
      store.set(recordStoreFamilyState.atomFamily(NOTE_ID), {
        __typename: 'Note',
        id: NOTE_ID,
        noteTargets: [],
      });
    },
  });

  return render(
    <I18nProvider i18n={i18n}>
      <MemoryRouter>
        <FileUploadProvider>
          <RecordTargetsInlineCell
            objectNameSingular={objectNameSingular}
            recordId={NOTE_ID}
            instanceIdPrefix="test-relations"
            showLabel
          />
        </FileUploadProvider>
      </MemoryRouter>
    </I18nProvider>,
    { wrapper: Wrapper },
  );
};

describe('RecordTargetsInlineCell', () => {
  it('renders the morph junction field of the object', async () => {
    renderCell('note');

    expect((await screen.findAllByText('Relations')).length).toBeGreaterThan(0);
  });

  it('renders nothing for an object without a morph junction', () => {
    renderCell('workspaceMember');

    expect(screen.queryByText('Relations')).not.toBeInTheDocument();
  });

  it('opens the record picker when the cell is clicked', async () => {
    renderCell('note');

    const relationsTexts = await screen.findAllByText('Relations');

    expect(
      screen.queryByTestId('inline-cell-edit-mode-container'),
    ).not.toBeInTheDocument();

    await userEvent.click(relationsTexts[relationsTexts.length - 1]);

    expect(
      screen.getByTestId('inline-cell-edit-mode-container'),
    ).toBeInTheDocument();
  });

  it('closes the record picker on escape', async () => {
    renderCell('note');

    const relationsTexts = await screen.findAllByText('Relations');

    await userEvent.click(relationsTexts[relationsTexts.length - 1]);

    expect(
      screen.getByTestId('inline-cell-edit-mode-container'),
    ).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    expect(
      screen.queryByTestId('inline-cell-edit-mode-container'),
    ).not.toBeInTheDocument();
  });
});
