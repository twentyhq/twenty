import EditableDate, { EditableDateProps } from '../EditableDate';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';

const component = {
  title: 'EditableDate',
  component: EditableDate,
};

export default component;

const Template: StoryFn<typeof EditableDate> = (args: EditableDateProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableDate {...args} />
      </div>
    </ThemeProvider>
  );
};

export const EditableDateStory = Template.bind({});
EditableDateStory.args = {
  value: new Date(),
  changeHandler: () => {
    console.log('changed');
  },
};
