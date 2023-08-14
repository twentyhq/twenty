import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SelectSheetStep } from '@/spreadsheet-import/components/steps/SelectSheetStep/SelectSheetStep';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

const meta: Meta<typeof SelectSheetStep> = {
  title: 'Modules/SpreadsheetImport/SelectSheetStep',
  component: SelectSheetStep,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const sheetNames = ['Sheet1', 'Sheet2', 'Sheet3'];

export function Default() {
  return (
    <Providers rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <SelectSheetStep
          sheetNames={sheetNames}
          onContinue={() => Promise.resolve()}
        />
      </ModalWrapper>
    </Providers>
  );
}
