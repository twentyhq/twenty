import { ModalWrapper } from '../../../components/ModalWrapper';
import { Providers } from '../../../components/Providers';
import { defaultTheme } from '../../../ReactSpreadsheetImport';
import {
  editableTableInitialData,
  mockRsiValues,
} from '../../../stories/mockRsiValues';
import { ValidationStep } from '../ValidationStep';

export default {
  title: 'Validation Step',
  parameters: {
    layout: 'fullscreen',
  },
};

const file = new File([''], 'file.csv');

export const Basic = () => (
  <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => {}}>
      <ValidationStep initialData={editableTableInitialData} file={file} />
    </ModalWrapper>
  </Providers>
);
