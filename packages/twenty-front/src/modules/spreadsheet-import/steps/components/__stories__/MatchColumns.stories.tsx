import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

import { mockRsiValues } from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { MatchColumnsStep } from '@/spreadsheet-import/steps/components/MatchColumnsStep/MatchColumnsStep';
import { matchColumnsState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/initialComputedColumnsState';
import { suggestedFieldsByColumnHeaderState } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/states/suggestedFieldsByColumnHeaderState';
import { type SpreadsheetImportStep } from '@/spreadsheet-import/steps/types/SpreadsheetImportStep';
import { type SpreadsheetImportField } from '@/spreadsheet-import/types/SpreadsheetImportField';
import { SpreadsheetColumnType } from '@/spreadsheet-import/types/SpreadsheetColumnType';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { IconsProviderDecorator } from '~/testing/decorators/IconsProviderDecorator';
import { ToastDecorator } from '~/testing/decorators/ToastDecorator';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const DIALOG_ID = 'match-columns-step';
const company = getMockObjectMetadataItemOrThrow('company');
const nameField = company.fields.find((field) => field.name === 'name');
const addressField = company.fields.find((field) => field.name === 'address');

if (!isDefined(nameField) || !isDefined(addressField)) {
  throw new Error(
    'The matching story requires company name and address fields',
  );
}

const teamField = {
  ...nameField,
  id: 'matching-team-field',
  name: 'team',
  label: 'Team',
  type: FieldMetadataType.SELECT,
};

const fields: SpreadsheetImportField[] = [
  {
    Icon: null,
    key: 'name',
    label: 'Name',
    fieldMetadataItemId: nameField.id,
    fieldMetadataType: FieldMetadataType.TEXT,
    fieldType: { type: 'input' },
    isNestedField: false,
  },
  ...[
    { key: 'addressStreet1', label: 'Street 1' },
    { key: 'addressCity', label: 'City' },
  ].map(({ key, label }): SpreadsheetImportField => ({
    Icon: null,
    key: `address.${key}`,
    label: `Address / ${label}`,
    fieldMetadataItemId: addressField.id,
    fieldMetadataType: FieldMetadataType.ADDRESS,
    fieldType: { type: 'input' },
    isNestedField: true,
  })),
  {
    Icon: null,
    key: 'team',
    label: 'Team',
    fieldMetadataItemId: teamField.id,
    fieldMetadataType: FieldMetadataType.SELECT,
    fieldType: {
      type: 'select',
      options: [
        { value: 'one', label: 'Team One', color: 'blue' },
        { value: 'two', label: 'Team Two', color: 'green' },
      ],
    },
    isNestedField: false,
  },
];

const storyValues = {
  ...mockRsiValues,
  spreadsheetImportFields: fields,
  availableFieldMetadataItems: [nameField, addressField, teamField],
};

const MatchColumnsExample = ({ onClose }: { onClose: () => void }) => {
  const { openDialog } = useDialog();

  return (
    <DialogComponentInstanceContext.Provider
      value={{ instanceId: 'dialog-manager' }}
    >
      <ReactSpreadsheetImportContextProvider values={storyValues}>
        <Button onClick={() => openDialog(DIALOG_ID)}>Open import</Button>
        <SpreadSheetImportModalWrapper
          modalInstanceId={DIALOG_ID}
          onClose={onClose}
        >
          <MatchColumnsStep
            headerValues={['company', 'street', 'team']}
            data={[
              ['Acme', 'Paris', 'Red'],
              ['Twenty', 'London', 'Blue'],
            ]}
            onBack={() => undefined}
            setCurrentStepState={() => undefined}
            setPreviousStepState={() => undefined}
            currentStepState={{} as SpreadsheetImportStep}
            nextStep={() => undefined}
            onError={() => undefined}
          />
        </SpreadSheetImportModalWrapper>
      </ReactSpreadsheetImportContextProvider>
    </DialogComponentInstanceContext.Provider>
  );
};

const meta: Meta<typeof MatchColumnsExample> = {
  title: 'Modules/SpreadsheetImport/MatchColumnsStep',
  component: MatchColumnsExample,
  parameters: { layout: 'fullscreen' },
  decorators: [ToastDecorator, IconsProviderDecorator],
  args: { onClose: fn() },
  beforeEach: () => {
    jotaiStore.set(matchColumnsState.atom, []);
    jotaiStore.set(suggestedFieldsByColumnHeaderState.atom, {
      company: [fields[0]],
    });

    return () => {
      jotaiStore.set(matchColumnsState.atom, []);
      jotaiStore.set(suggestedFieldsByColumnHeaderState.atom, {});
    };
  },
};

export default meta;
type Story = StoryObj<typeof MatchColumnsExample>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open import' }),
    );
    await within(canvasElement.ownerDocument.body).findByRole('dialog', {
      name: 'Import data',
    });
  },
};

export const CompositeFieldAndBack: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open import' }),
    );
    const dialog = await body.findByRole('dialog', { name: 'Import data' });
    const trigger = within(dialog).getAllByRole('button', {
      name: 'Select column...',
    })[1];
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', {
      name: 'Select matching field',
    });
    const search = within(popup).getByRole('searchbox', {
      name: 'Search fields',
    });
    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'address');
    await userEvent.keyboard('{Enter}');
    await within(popup).findByRole('button', { name: 'Street 1' });
    await userEvent.click(
      within(popup).getByRole('button', { name: 'Address, back to fields' }),
    );
    await userEvent.click(
      await within(popup).findByRole('button', { name: 'Address Address' }),
    );
    const subFieldSearch = within(popup).getByRole('searchbox', {
      name: 'Search fields',
    });
    await userEvent.type(subFieldSearch, 'City');
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Address / City');
    expect(dialog).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.click(trigger);
    const reopenedPopup = await body.findByRole('dialog', {
      name: 'Select matching field',
    });
    expect(within(reopenedPopup).getByRole('searchbox')).toHaveValue('');
    expect(
      within(reopenedPopup).getByRole('button', { name: 'Do not import' }),
    ).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(reopenedPopup).not.toBeInTheDocument());
    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const SuggestionsIgnoreAndCancel: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open import' }),
    );
    const dialog = await body.findByRole('dialog', { name: 'Import data' });
    const trigger = within(dialog).getAllByRole('button', {
      name: 'Select column...',
    })[0];
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', {
      name: 'Select matching field',
    });
    const suggestedSection = within(popup).getByText('Suggested').parentElement;

    if (!isDefined(suggestedSection)) {
      throw new Error('The suggested field section is missing');
    }

    await userEvent.click(
      within(suggestedSection).getByRole('button', { name: 'Name Text' }),
    );
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Name');

    await userEvent.click(trigger);
    const reopenedPopup = await body.findByRole('dialog', {
      name: 'Select matching field',
    });
    const reopenedSuggestedSection =
      within(reopenedPopup).getByText('Suggested').parentElement;

    if (!isDefined(reopenedSuggestedSection)) {
      throw new Error('The suggested field section is missing');
    }

    expect(
      within(reopenedSuggestedSection).getByRole('button', {
        name: 'Name Text',
      }),
    ).toBeEnabled();
    await userEvent.click(
      within(reopenedPopup).getByRole('button', {
        name: 'Cancel field selection',
      }),
    );
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Select matching field' }),
      ).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveTextContent('Name');

    await userEvent.click(trigger);
    const ignoredPopup = await body.findByRole('dialog', {
      name: 'Select matching field',
    });
    await userEvent.type(
      within(ignoredPopup).getByRole('searchbox', { name: 'Search fields' }),
      'do not import',
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(ignoredPopup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Do not import');
    expect(dialog).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
  },
};

export const SubMatchingSearchSkipsUnmatchedSelection: Story = {
  beforeEach: () => {
    jotaiStore.set(matchColumnsState.atom, [
      { header: 'company', index: 0, type: SpreadsheetColumnType.empty },
      { header: 'street', index: 1, type: SpreadsheetColumnType.empty },
      {
        header: 'team',
        index: 2,
        type: SpreadsheetColumnType.matchedSelect,
        value: 'team',
        matchedOptions: [{ entry: 'Red', value: 'two' }],
      },
    ]);
  },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open import' }),
    );
    const dialog = await body.findByRole('dialog', { name: 'Import data' });
    await userEvent.click(within(dialog).getByText('Match Team (0 Unmatched)'));
    const trigger = await within(dialog).findByRole('button', {
      name: 'Team Two',
    });
    await userEvent.click(trigger);
    const popup = await body.findByRole('dialog', { name: 'Match Red' });
    const options = within(popup).getAllByRole('button');
    expect(options[0]).toHaveTextContent('Team Two');
    await userEvent.type(
      within(popup).getByRole('searchbox', { name: 'Search' }),
      'Team One',
    );
    expect(
      within(popup).queryByRole('button', { name: 'Team Two' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Team One');
    expect(dialog).toBeVisible();
    expect(args.onClose).not.toHaveBeenCalled();
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
