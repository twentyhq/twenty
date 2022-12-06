import Booking from '../Booking';

export default {
  title: 'DiscussionPanel',
  component: Booking,
};

export const BookingDefault = () => (
  <Booking
    booking={{
      id: 1,
      time: 'Wed, Sep 10, 2022',
      user: 'Georges',
      nights: 4,
      guests: 5,
      price: '756.90$',
      listing: 'Rochefort Montagne',
      dateRange: 'Mon, Sep 30 - Fri, Oct 2',
    }}
  />
);
