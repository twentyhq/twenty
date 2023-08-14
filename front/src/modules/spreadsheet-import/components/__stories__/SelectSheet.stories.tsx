import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SelectSheetStep } from '@/spreadsheet-import/components/steps/SelectSheetStep/SelectSheetStep';
import { mockRsiValues } from '@/spreadsheet-import/stories/mockRsiValues';

export default {
  title: 'Select Sheet Step',
  parameters: {
    layout: 'fullscreen',
  },
};

const sheetNames = ['Sheet1', 'Sheet2', 'Sheet3'];

export const Basic = () => (
  <Providers rsiValues={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => {}}>
      <SelectSheetStep sheetNames={sheetNames} onContinue={async () => {}} />
    </ModalWrapper>
  </Providers>
);
