import { ModalWrapper } from '../../../components/ModalWrapper';
import { Providers } from '../../../components/Providers';
import { defaultTheme } from '../../../ReactSpreadsheetImport';
import { mockRsiValues } from '../../../stories/mockRsiValues';
import { UploadStep } from '../UploadStep';

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
