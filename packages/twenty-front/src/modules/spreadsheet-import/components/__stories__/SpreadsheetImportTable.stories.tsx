import { RsiContext } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadsheetImportTable } from '@/spreadsheet-import/components/SpreadsheetImportTable';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { SelectColumn } from 'react-data-grid';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 240px;
  width: 480px;
`;

const ROWS = Array.from({ length: 60 }, (_, index) => ({
  id: `row-${index}`,
  name: `Contact ${index + 1}`,
}));
const COLUMNS = [{ key: 'name', name: 'Name' }];
const MULTIPLE_SELECTION_COLUMNS = [SelectColumn, ...COLUMNS];
const rowKeyGetter = (row: (typeof ROWS)[number]) => row.id;

const SingleSelectionExample = ({
  onSelectedRowChange,
}: {
  onSelectedRowChange: (rowKey: string) => void;
}) => {
  const [selectedRowKey, setSelectedRowKey] = useState('row-0');
  const [rows, setRows] = useState(ROWS);

  return (
    <>
      <button onClick={() => setRows([...rows].reverse())}>Reverse rows</button>
      <SpreadsheetImportTable
        columns={COLUMNS}
        rows={rows}
        rowKeyGetter={rowKeyGetter}
        selectionMode="single"
        selectionLabel="Select a contact"
        selectedRowKey={selectedRowKey}
        onSelectedRowChange={(rowKey) => {
          setSelectedRowKey(rowKey);
          onSelectedRowChange(rowKey);
        }}
      />
    </>
  );
};

const MultipleSelectionExample = () => {
  const [selectedRows, setSelectedRows] = useState<ReadonlySet<string>>(
    new Set(),
  );

  return (
    <SpreadsheetImportTable
      columns={MULTIPLE_SELECTION_COLUMNS}
      rows={ROWS}
      rowKeyGetter={rowKeyGetter}
      selectedRows={selectedRows}
      onSelectedRowsChange={setSelectedRows}
    />
  );
};

const meta: Meta<typeof SingleSelectionExample> = {
  title: 'Modules/SpreadsheetImport/SpreadsheetImportTable',
  component: SingleSelectionExample,
  decorators: [
    (Story) => (
      <RsiContext.Provider value={{ rtl: false }}>
        <StyledContainer>
          <Story />
        </StyledContainer>
      </RsiContext.Provider>
    ),
    ComponentDecorator,
  ],
  args: { onSelectedRowChange: fn() },
};

export default meta;
type Story = StoryObj<typeof SingleSelectionExample>;

export const SingleSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const grid = canvas.getByRole('grid');
    await expect(grid).not.toHaveAttribute('aria-multiselectable', 'true');
    await expect(
      canvas.getByRole('radiogroup', { name: 'Select a contact' }),
    ).toBeVisible();

    await userEvent.click(canvas.getByRole('gridcell', { name: 'Contact 2' }));
    await expect(args.onSelectedRowChange).toHaveBeenCalledTimes(1);
    await expect(args.onSelectedRowChange).toHaveBeenLastCalledWith('row-1');

    const radios = canvas.getAllByRole('radio', { name: 'Select' });
    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
    await userEvent.click(radios[2]);
    await expect(args.onSelectedRowChange).toHaveBeenCalledTimes(2);
    await expect(args.onSelectedRowChange).toHaveBeenLastCalledWith('row-2');

    await userEvent.keyboard('{ArrowRight}{ArrowDown}');
    await expect(
      canvas.getByRole('gridcell', { name: 'Contact 4' }),
    ).toHaveFocus();
    await expect(radios[3]).toBeChecked();
    await expect(radios[2]).not.toBeChecked();
    await expect(args.onSelectedRowChange).toHaveBeenCalledTimes(3);
    await expect(args.onSelectedRowChange).toHaveBeenLastCalledWith('row-3');
  },
};

export const VirtualizedSelection: Story = {
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Contact 1' }));
    await userEvent.keyboard('{Control>}{End}{/Control}');
    const lastCell = await canvas.findByRole('gridcell', {
      name: 'Contact 60',
    });
    await waitFor(() => expect(lastCell).toHaveFocus());
    await expect(
      within(canvas.getByRole('row', { name: /Contact 60/ })).getByRole(
        'radio',
      ),
    ).toBeChecked();
    await expect(args.onSelectedRowChange).toHaveBeenLastCalledWith('row-59');

    await userEvent.click(canvas.getByRole('button', { name: 'Reverse rows' }));
    await userEvent.tab();
    await userEvent.keyboard('{Control>}{Home}{/Control}{ArrowDown}');
    await canvas.findByRole('gridcell', { name: 'Contact 60' });
    await expect(
      within(canvas.getByRole('row', { name: /Contact 60/ })).getByRole(
        'radio',
      ),
    ).toBeChecked();
    await expect(args.onSelectedRowChange).toHaveBeenCalledTimes(1);
  },
};

export const MultipleSelection: Story = {
  render: () => <MultipleSelectionExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('radiogroup')).not.toBeInTheDocument();
    await expect(canvas.getByRole('grid')).toHaveAttribute(
      'aria-multiselectable',
      'true',
    );
    const checkboxes = canvas.getAllByRole('checkbox', { name: 'Select' });
    await userEvent.click(checkboxes[0]);
    await userEvent.click(checkboxes[1]);
    await expect(checkboxes[0]).toBeChecked();
    await expect(checkboxes[1]).toBeChecked();
    await userEvent.click(checkboxes[0]);
    await expect(checkboxes[0]).not.toBeChecked();
    await expect(checkboxes[1]).toBeChecked();
  },
};
