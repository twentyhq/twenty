import { type Meta } from '@storybook/react-vite';

import {
  headerSelectionTableFields,
  mockRsiValues,
} from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { SelectHeaderStep } from '@/spreadsheet-import/steps/components/SelectHeaderStep/SelectHeaderStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { Provider as JotaiProvider } from 'jotai';
import { RecoilRoot } from 'recoil';

const meta: Meta<typeof SelectHeaderStep> = {
  title: 'Modules/SpreadsheetImport/SelectHeaderStep',
  component: SelectHeaderStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => {
      jotaiStore.set(
        isModalOpenedComponentState.atomFamily({
          instanceId: 'select-header-step',
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
export const Default = () => (
  <DialogComponentInstanceContext.Provider
    value={{ instanceId: 'dialog-manager' }}
  >
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <SpreadSheetImportModalWrapper
        modalId="select-header-step"
        onClose={() => null}
      >
        <SelectHeaderStep
          importedRows={headerSelectionTableFields}
          setCurrentStepState={() => null}
          nextStep={() => Promise.resolve()}
          setPreviousStepState={() => null}
          onError={() => null}
          onBack={() => Promise.resolve()}
          currentStepState={{
            type: SpreadsheetImportStepType.selectHeader,
            data: headerSelectionTableFields,
          }}
        />
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogComponentInstanceContext.Provider>
);
