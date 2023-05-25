import { EditablePeopleFullName } from '../../people/EditablePeopleFullName';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';

const component = {
  title: 'EditableFullName',
  component: EditablePeopleFullName,
};

type OwnProps = {
  firstname: string;
  lastname: string;
  onChange: (firstname: string, lastname: string) => void;
};

export default component;

const Template: StoryFn<typeof EditablePeopleFullName> = (args: OwnProps) => {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <div data-testid="content-editable-parent">
          <EditablePeopleFullName {...args} />
        </div>
      </ThemeProvider>
    </MemoryRouter>
  );
};

export const EditableFullNameStory = Template.bind({});
EditableFullNameStory.args = {
  firstname: 'John',
  lastname: 'Doe',
  onChange: () => {
    console.log('validated');
  },
};
