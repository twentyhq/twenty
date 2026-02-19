import { type Meta } from '@storybook/react-vite';

import {
  editableTableInitialData,
  importedColums,
  mockRsiValues,
} from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { ValidationStep } from '@/spreadsheet-import/steps/components/ValidationStep/ValidationStep';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';

const meta: Meta<typeof ValidationStep> = {
  title: 'Modules/SpreadsheetImport/ValidationStep',
  component: ValidationStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      jotaiStore.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: 'validation-step',
        }),
        true,
      );
      return (
        <JotaiProvider store={jotaiStore}>
          <RecoilRoot>
            <Story />
          </RecoilRoot>
        </JotaiProvider>
      );
    },
  ],
};

export default meta;

const file = new File([''], 'file.csv');

export const Default = () => (
  <DialogComponentInstanceContext.Provider
    value={{ instanceId: 'dialog-manager' }}
  >
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <SpreadSheetImportModalWrapper
        modalId="validation-step"
        onClose={() => null}
      >
        <ValidationStep
          initialData={editableTableInitialData}
          file={file}
          importedColumns={importedColums}
          onBack={() => Promise.resolve()}
          setCurrentStepState={() => null}
        />
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogComponentInstanceContext.Provider>
);
