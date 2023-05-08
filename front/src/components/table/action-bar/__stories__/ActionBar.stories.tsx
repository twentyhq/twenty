import ActionBar from '../ActionBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';

const component = {
  title: 'ActionBar',
  component: ActionBar,
};

type OwnProps = {
  onDeleteClick: () => void;
};

export default component;

const Template: StoryFn<typeof ActionBar> = (args: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <ActionBar {...args} />
    </ThemeProvider>
  );
};

export const ActionBarStory = Template.bind({});
ActionBarStory.args = {
  onDeleteClick: () => {
    console.log('deleted');
  },
};
