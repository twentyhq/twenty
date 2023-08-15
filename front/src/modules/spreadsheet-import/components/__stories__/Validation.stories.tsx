import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { ValidationStep } from '@/spreadsheet-import/components/steps/ValidationStep/ValidationStep';
import {
  editableTableInitialData,
  mockRsiValues,
} from '@/spreadsheet-import/tests/mockRsiValues';

const meta: Meta<typeof ValidationStep> = {
  title: 'Modules/SpreadsheetImport/ValidationStep',
  component: ValidationStep,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const file = new File([''], 'file.csv');

export function Default() {
  return (
    <Providers rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <ValidationStep initialData={editableTableInitialData} file={file} />
      </ModalWrapper>
    </Providers>
  );
}
