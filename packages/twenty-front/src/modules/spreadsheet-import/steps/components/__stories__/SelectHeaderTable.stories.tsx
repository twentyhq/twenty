import { RsiContext } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SelectHeaderTable } from '@/spreadsheet-import/steps/components/SelectHeaderStep/components/SelectHeaderTable';
import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { ComponentDecorator } from 'twenty-ui/testing';

const StyledContainer = styled.div`
  display: flex;
  height: 240px;
  width: 480px;
`;

const SelectHeaderTableExample = () => {
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  return (
    <RsiContext.Provider value={{ rtl: false }}>
      <StyledContainer>
        <SelectHeaderTable
          importedRows={[
            ['Report', 'September'],
            ['Name', 'Email'],
            ['Ada', 'ada@example.com'],
          ]}
          selectedRowIndex={selectedRowIndex}
          onSelectedRowChange={setSelectedRowIndex}
        />
      </StyledContainer>
    </RsiContext.Provider>
  );
};

const meta: Meta<typeof SelectHeaderTableExample> = {
  title: 'Modules/SpreadsheetImport/SelectHeaderTable',
  component: SelectHeaderTableExample,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SelectHeaderTableExample>;

export const SingleRowSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio', { name: 'Select' });
    await expect(radios[0]).toBeChecked();
    await userEvent.click(radios[1]);
    await expect(radios[1]).toBeChecked();
    await expect(radios[0]).not.toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() => expect(radios[2]).toBeChecked());
    await expect(radios[1]).not.toBeChecked();
    await userEvent.click(canvas.getByRole('gridcell', { name: 'Report' }));
    await expect(radios[0]).toBeChecked();
    await expect(radios[2]).not.toBeChecked();
  },
};
