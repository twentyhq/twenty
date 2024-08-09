import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SelectSheetStep } from '@/spreadsheet-import/steps/components/SelectSheetStep/SelectSheetStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';

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
  <DialogManagerScope dialogManagerScopeId="dialog-manager">
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <SelectSheetStep
          sheetNames={sheetNames}
          setState={() => null}
          setPreviousState={() => null}
          errorToast={() => null}
          state={{
            type: SpreadsheetImportStepType.selectSheet,
            data: [],
          }}
          onBack={() => Promise.resolve()}
        />
      </ModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogManagerScope>
);
