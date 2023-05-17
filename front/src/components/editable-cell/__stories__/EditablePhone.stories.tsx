import EditablePhone from '../EditablePhone';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

const component = {
  title: 'EditablePhone',
  component: EditablePhone,
};

type OwnProps = {
  value: string;
  changeHandler: (updated: string) => void;
};

export default component;

const Template: StoryFn<typeof EditablePhone> = (args: OwnProps) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <div data-testid="content-editable-parent">
          <EditablePhone {...args} />
        </div>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export const EditablePhoneStory = Template.bind({});
EditablePhoneStory.args = {
  placeholder: 'Test placeholder',
  value: '+33657646543',
  changeHandler: () => {
    console.log('changed');
  },
};
