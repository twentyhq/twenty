import { Meta } from '@storybook/react';

import { mockRsiValues } from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SelectSheetStep } from '@/spreadsheet-import/steps/components/SelectSheetStep/SelectSheetStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
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
          setCurrentStepState={() => {}}
          setPreviousStepState={() => {}}
          currentStepState={{
            type: SpreadsheetImportStepType.selectSheet,
            workbook: {
              SheetNames: sheetNames,
              Sheets: {
                Sheet1: {
                  A1: 1,
                  A2: 2,
                  A3: 3,
                },
                Sheet2: {
                  A1: 1,
                  A2: 2,
                  A3: 3,
                },
                Sheet3: {
                  A1: 1,
                  A2: 2,
                  A3: 3,
                },
              },
            },
          }}
          onError={() => null}
          onBack={() => Promise.resolve()}
        />
      </ModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogManagerScope>
);
