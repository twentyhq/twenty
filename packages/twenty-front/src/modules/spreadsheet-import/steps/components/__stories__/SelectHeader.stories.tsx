import { Meta } from '@storybook/react';

import {
  headerSelectionTableFields,
  mockRsiValues,
} from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { SelectHeaderStep } from '@/spreadsheet-import/steps/components/SelectHeaderStep/SelectHeaderStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { RecoilRoot } from 'recoil';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';

const meta: Meta<typeof SelectHeaderStep> = {
  title: 'Modules/SpreadsheetImport/SelectHeaderStep',
  component: SelectHeaderStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            isModalOpenedComponentState.atomFamily({
              instanceId: 'select-header-step',
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
export const Default = () => (
  <DialogManagerScope dialogManagerScopeId="dialog-manager">
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
  </DialogManagerScope>
);
