import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/Providers';
import { UploadStep } from '@/spreadsheet-import/steps/components/UploadStep/UploadStep';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';
import { DialogManagerScope } from '@/ui/feedback/dialog-manager/scopes/DialogManagerScope';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

const meta: Meta<typeof UploadStep> = {
  title: 'Modules/SpreadsheetImport/UploadStep',
  component: UploadStep,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [SnackBarDecorator],
};

export default meta;

export const Default = () => (
  <DialogManagerScope dialogManagerScopeId="dialog-manager">
    <Providers values={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <UploadStep onContinue={() => Promise.resolve()} />
      </ModalWrapper>
    </Providers>
  </DialogManagerScope>
);
