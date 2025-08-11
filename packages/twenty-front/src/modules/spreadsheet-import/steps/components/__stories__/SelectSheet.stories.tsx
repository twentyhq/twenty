import { type Meta } from '@storybook/react';

import { mockRsiValues } from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { SelectSheetStep } from '@/spreadsheet-import/steps/components/SelectSheetStep/SelectSheetStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { RecoilRoot } from 'recoil';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof SelectSheetStep> = {
  title: 'Modules/SpreadsheetImport/SelectSheetStep',
  component: SelectSheetStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            isModalOpenedComponentState.atomFamily({
              instanceId: 'select-sheet-step',
            }),
            true,
          );
        }}
      >
        <Story />
      </RecoilRoot>
    ),
    I18nFrontDecorator,
  ],
};

export default meta;

const sheetNames = ['Sheet1', 'Sheet2', 'Sheet3'];

export const Default = () => (
  <DialogComponentInstanceContext.Provider
    value={{ instanceId: 'dialog-manager' }}
  >
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <SpreadSheetImportModalWrapper
        modalId="select-sheet-step"
        onClose={() => null}
      >
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
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogComponentInstanceContext.Provider>
);
