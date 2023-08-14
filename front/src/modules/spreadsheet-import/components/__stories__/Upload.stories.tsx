import { Meta } from '@storybook/react';

import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { UploadStep } from '@/spreadsheet-import/components/steps/UploadStep/UploadStep';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

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
    <Providers rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => null}>
        <UploadStep onContinue={() => Promise.resolve()} />
      </ModalWrapper>
    </Providers>
  );
}
