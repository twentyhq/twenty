import { Meta } from '@storybook/react';

import {
  editableTableInitialData,
  importedColums,
  mockRsiValues,
} from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { ValidationStep } from '@/spreadsheet-import/steps/components/ValidationStep/ValidationStep';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
const meta: Meta<typeof ValidationStep> = {
  title: 'Modules/SpreadsheetImport/ValidationStep',
  component: ValidationStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [I18nFrontDecorator],
};

export default meta;

const file = new File([''], 'file.csv');

export const Default = () => (
  <DialogManagerScope dialogManagerScopeId="dialog-manager">
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <ModalWrapper
        modalId="validation-step"
        isOpen={true}
        onClose={() => null}
      >
        <ValidationStep
          initialData={editableTableInitialData}
          file={file}
          importedColumns={importedColums}
          onBack={() => Promise.resolve()}
          setCurrentStepState={() => null}
        />
      </ModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogManagerScope>
);
