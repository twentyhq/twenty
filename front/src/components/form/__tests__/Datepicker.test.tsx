import { fireEvent, render } from '@testing-library/react';

import { DatePickerStory } from '../__stories__/Datepicker.stories';
import { act } from 'react-dom/test-utils';

it('Checks the datepicker renders', () => {
  const changeHandler = jest.fn();
  const { getByText } = render(
    <DatePickerStory
      date={new Date('2021-03-03')}
      onChangeHandler={changeHandler}
    />,
  );
  act(() => {
    fireEvent.click(getByText('Mar 3, 2021'));
  });
  expect(getByText('March 2021')).toBeInTheDocument();
  act(() => {
    fireEvent.click(getByText('5'));
  });
  expect(changeHandler).toHaveBeenCalledWith(new Date('2021-03-05'));
});
