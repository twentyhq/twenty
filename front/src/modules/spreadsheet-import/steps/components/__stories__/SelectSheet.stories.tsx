import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/Providers';
import { SelectSheetStep } from '@/spreadsheet-import/steps/components/SelectSheetStep/SelectSheetStep';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';

const meta: Meta<typeof SelectSheetStep> = {
  title: 'Modules/SpreadsheetImport/SelectSheetStep',
  component: SelectSheetStep,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const sheetNames = ['Sheet1', 'Sheet2', 'Sheet3'];

export const Default = () => (
  <Providers values={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => null}>
      <SelectSheetStep
        sheetNames={sheetNames}
        onContinue={() => Promise.resolve()}
      />
    </ModalWrapper>
  </Providers>
);
