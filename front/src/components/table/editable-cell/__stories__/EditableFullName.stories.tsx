import EditableFullName from '../EditableFullName';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

const component = {
  title: 'EditableFullName',
  component: EditableFullName,
};

type OwnProps = {
  firstname: string;
  lastname: string;
  changeHandler: (firstname: string, lastname: string) => void;
};

export default component;

const Template: StoryFn<typeof EditableFullName> = (args: OwnProps) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <div data-testid="content-editable-parent">
          <EditableFullName {...args} />
        </div>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export const EditableFullNameStory = Template.bind({});
EditableFullNameStory.args = {
  firstname: 'John',
  lastname: 'Doe',
  changeHandler: () => {
    console.log('changed');
  },
};
