import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { UploadStep } from '@/spreadsheet-import/components/steps/UploadStep/UploadStep';
import { defaultTheme } from '@/spreadsheet-import/ReactSpreadsheetImport';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

export default {
  title: 'Upload Step',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Basic = () => {
  return (
    <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
      <ModalWrapper isOpen={true} onClose={() => {}}>
        <UploadStep onContinue={async () => {}} />
      </ModalWrapper>
    </Providers>
  );
};
