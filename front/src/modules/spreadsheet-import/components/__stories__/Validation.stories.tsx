import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { ValidationStep } from '@/spreadsheet-import/components/steps/ValidationStep/ValidationStep';
import {
  editableTableInitialData,
  mockRsiValues,
} from '@/spreadsheet-import/stories/mockRsiValues';

export default {
  title: 'Validation Step',
  parameters: {
    layout: 'fullscreen',
  },
};

const file = new File([''], 'file.csv');

export const Basic = () => (
  <Providers rsiValues={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => {}}>
      <ValidationStep initialData={editableTableInitialData} file={file} />
    </ModalWrapper>
  </Providers>
);
