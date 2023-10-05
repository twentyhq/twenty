import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/Providers';
import { SelectHeaderStep } from '@/spreadsheet-import/steps/components/SelectHeaderStep/SelectHeaderStep';
import {
  headerSelectionTableFields,
  mockRsiValues,
} from '@/spreadsheet-import/tests/mockRsiValues.test';

const meta: Meta<typeof SelectHeaderStep> = {
  title: 'Modules/SpreadsheetImport/SelectHeaderStep',
  component: SelectHeaderStep,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export const Default = () => (
  <Providers values={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => null}>
      <SelectHeaderStep
        data={headerSelectionTableFields}
        onContinue={() => Promise.resolve()}
      />
    </ModalWrapper>
  </Providers>
);
