import { type Meta } from '@storybook/react';

import { mockRsiValues } from '@/spreadsheet-import/__mocks__/mockRsiValues';
import { ReactSpreadsheetImportContextProvider } from '@/spreadsheet-import/components/ReactSpreadsheetImportContextProvider';
import { SpreadSheetImportModalWrapper } from '@/spreadsheet-import/components/SpreadSheetImportModalWrapper';
import { UploadStep } from '@/spreadsheet-import/steps/components/UploadStep/UploadStep';
import { SpreadsheetImportStepType } from '@/spreadsheet-import/steps/types/SpreadsheetImportStepType';
import { DialogComponentInstanceContext } from '@/ui/feedback/dialog-manager/contexts/DialogComponentInstanceContext';
import { isModalOpenedComponentState } from '@/ui/layout/modal/states/isModalOpenedComponentState';
import { RecoilRoot } from 'recoil';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof UploadStep> = {
  title: 'Modules/SpreadsheetImport/UploadStep',
  component: UploadStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    ObjectMetadataItemsDecorator,
    ContextStoreDecorator,
    (Story) => (
      <RecoilRoot
        initializeState={({ set }) => {
          set(
            isModalOpenedComponentState.atomFamily({
              instanceId: 'upload-step',
            }),
            true,
          );
        }}
      >
        <Story />
      </RecoilRoot>
    ),
    SnackBarDecorator,
    I18nFrontDecorator,
  ],
};

export default meta;

export const Default = () => (
  <DialogComponentInstanceContext.Provider
    value={{ instanceId: 'dialog-manager' }}
  >
    <ReactSpreadsheetImportContextProvider values={mockRsiValues}>
      <SpreadSheetImportModalWrapper modalId="upload-step" onClose={() => null}>
        <UploadStep
          setUploadedFile={() => null}
          setCurrentStepState={() => null}
          onError={() => null}
          nextStep={() => null}
          setPreviousStepState={() => null}
          currentStepState={{ type: SpreadsheetImportStepType.upload }}
        />
      </SpreadSheetImportModalWrapper>
    </ReactSpreadsheetImportContextProvider>
  </DialogComponentInstanceContext.Provider>
);
