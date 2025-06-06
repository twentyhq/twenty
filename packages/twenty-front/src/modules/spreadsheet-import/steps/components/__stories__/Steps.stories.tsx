import { Meta, StoryObj } from '@storybook/react';

import { ComponentWithRecoilScopeDecorator } from '~/testing/decorators/ComponentWithRecoilScopeDecorator';
import { SnackBarDecorator } from '~/testing/decorators/SnackBarDecorator';

import { stepBarInternalState } from '@/ui/navigation/step-bar/states/stepBarInternalState';
import { I18nFrontDecorator } from '~/testing/decorators/I18nFrontDecorator';
import { SpreadsheetImportStepperContainer } from '../SpreadsheetImportStepperContainer';

const meta: Meta<typeof SpreadsheetImportStepperContainer> = {
  title: 'Modules/SpreadsheetImport/Steps',
  component: SpreadsheetImportStepperContainer,
  decorators: [
    ComponentWithRecoilScopeDecorator,
    SnackBarDecorator,
    I18nFrontDecorator,
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
