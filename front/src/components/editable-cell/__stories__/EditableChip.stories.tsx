import EditableChip, { EditableChipProps } from '../EditableChip';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import CompanyChip from '../../chip/CompanyChip';

const component = {
  title: 'EditableChip',
  component: EditableChip,
};

export default component;

const Template: StoryFn<typeof EditableChip> = (args: EditableChipProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableChip {...args} />
      </div>
    </ThemeProvider>
  );
};

export const EditableChipStory = Template.bind({});
EditableChipStory.args = {
  ChipComponent: CompanyChip,
  placeholder: 'Test',
  value: 'Test',
  picture: 'https://picsum.photos/200',
  changeHandler: () => {
    console.log('changed');
  },
};
