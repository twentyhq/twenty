import { render } from '@testing-library/react';

import { BookingDefault } from '../__stories__/Booking.stories';

it('Checks the booking event render', () => {
  const { getAllByText } = render(<BookingDefault />);

  const text = getAllByText('Rochefort Montagne');
  expect(text).toBeDefined();
});
