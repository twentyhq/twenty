import EditableText from '../EditableText';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';

const component = {
  title: 'EditableText',
  component: EditableText,
};

type OwnProps = {
  content: string;
  changeHandler: (updated: string) => void;
};

export default component;

const Template: StoryFn<typeof EditableText> = (args: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableText {...args} />
      </div>
    </ThemeProvider>
  );
};

export const EditableTextStory = Template.bind({});
EditableTextStory.args = {
  placeholder: 'Test placeholder',
  content: 'Test string',
  changeHandler: () => {
    console.log('changed');
  },
};
