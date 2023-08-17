import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/Providers';
import { UploadStep } from '@/spreadsheet-import/steps/components/UploadStep/UploadStep';
import { mockRsiValues } from '@/spreadsheet-import/tests/mockRsiValues';

const meta: Meta<typeof UploadStep> = {
  title: 'Modules/SpreadsheetImport/UploadStep',
  component: UploadStep,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

export function Default() {
  return (
    <Providers values={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <UploadStep onContinue={() => Promise.resolve()} />
      </ModalWrapper>
    </Providers>
  );
}
