import EditableCell from '../EditableCell';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';

const component = {
  title: 'EditableCell',
  component: EditableCell,
};

type OwnProps = {
  content: string;
  changeHandler: (updated: string) => void;
};

export default component;

const Template: StoryFn<typeof EditableCell> = (args: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <div data-testid="content-editable-parent">
        <EditableCell {...args} />
      </div>
    </ThemeProvider>
  );
};

export const EditableCellStory = Template.bind({});
EditableCellStory.args = {
  content: 'Test string',
};
