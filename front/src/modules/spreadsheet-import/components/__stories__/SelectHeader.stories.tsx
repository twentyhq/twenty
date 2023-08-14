import { ModalWrapper } from '@/spreadsheet-import/components/core/ModalWrapper';
import { Providers } from '@/spreadsheet-import/components/core/Providers';
import { SelectHeaderStep } from '@/spreadsheet-import/components/steps/SelectHeaderStep/SelectHeaderStep';
import { defaultTheme } from '@/spreadsheet-import/ReactSpreadsheetImport';
import {
  headerSelectionTableFields,
  mockRsiValues,
} from '@/spreadsheet-import/stories/mockRsiValues';

export default {
  title: 'Select Header Step',
  parameters: {
    layout: 'fullscreen',
  },
};

export const Basic = () => (
  <Providers theme={defaultTheme} rsiValues={mockRsiValues}>
    <ModalWrapper isOpen={true} onClose={() => {}}>
      <SelectHeaderStep
        data={headerSelectionTableFields}
        onContinue={async () => {}}
      />
    </ModalWrapper>
  </Providers>
);
