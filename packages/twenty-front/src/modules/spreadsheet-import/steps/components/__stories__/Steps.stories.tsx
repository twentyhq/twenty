import { type Meta, type StoryObj } from '@storybook/react-vite';

import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { SpreadsheetImportStepperContainer } from '@/spreadsheet-import/steps/components/SpreadsheetImportStepperContainer';
import { stepBarInternalState } from '@/ui/navigation/step-bar/states/stepBarInternalState';
import { ContextStoreDecorator } from '~/testing/decorators/ContextStoreDecorator';
import { ObjectMetadataItemsDecorator } from '~/testing/decorators/ObjectMetadataItemsDecorator';

const meta: Meta<typeof SpreadsheetImportStepperContainer> = {
  title: 'Modules/SpreadsheetImport/Steps',
  component: SpreadsheetImportStepperContainer,
  decorators: [
    SnackBarDecorator,
    ObjectMetadataItemsDecorator,
    ContextStoreDecorator,
  ],
  parameters: {
    initialRecoilState: {
      [stepBarInternalState.key]: { activeStep: 0 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof SpreadsheetImportStepperContainer>;

export const Default: Story = {
  play: async () => {
    // const canvas = within(document.body);
    // TODO : Uncomment test once translation will be updated
    // expect(await canvas.findByText('Upload File')).toBeInTheDocument();
    // expect(await canvas.findByText('Match Columns')).toBeInTheDocument();
    // expect(await canvas.findByText('Validate Data')).toBeInTheDocument();
    // expect(await canvas.findByText('Select file')).toBeInTheDocument();
  },
};
