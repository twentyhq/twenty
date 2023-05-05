import DatePicker, { DatePickerProps } from '../DatePicker';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../layout/styles/themes';
import { StoryFn } from '@storybook/react';
import styled from '@emotion/styled';

const component = {
  title: 'DatePicker',
  component: DatePicker,
};

export default component;

const StyledContainer = styled.div`
  height: 300px;
  width: 200px;
}`;

const Template: StoryFn<typeof DatePicker> = (args: DatePickerProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <StyledContainer>
        <DatePicker {...args} />
      </StyledContainer>
    </ThemeProvider>
  );
};

export const DatePickerStory = Template.bind({});
DatePickerStory.args = {
  isOpen: true,
  date: new Date(),
  onChangeHandler: () => {
    console.log('changed');
  },
};
