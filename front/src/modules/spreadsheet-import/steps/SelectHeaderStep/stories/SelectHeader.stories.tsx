import { ModalWrapper } from '../../../components/ModalWrapper';
import { Providers } from '../../../components/Providers';
import { defaultTheme } from '../../../ReactSpreadsheetImport';
import {
  headerSelectionTableFields,
  mockRsiValues,
} from '../../../stories/mockRsiValues';
import { SelectHeaderStep } from '../SelectHeaderStep';
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
