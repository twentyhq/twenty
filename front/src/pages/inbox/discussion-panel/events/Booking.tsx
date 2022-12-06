import styled from '@emotion/styled';

export type BookingEvent = {
  id: number;
  user: string;
  time: string;
  listing: string;
  nights: number;
  guests: number;
  price: string;
  dateRange: string;
};

type OwnProps = {
  booking: BookingEvent;
};

const StyledBooking = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledLabel = styled.div`
  font-size: 12px;
  color: #2e3138;
  margin-bottom: 8px;
`;

const StyledContainer = styled.div`
  display: flex;
  padding: 16px;
  flex-direction: row;
  border: 1px solid #000000;
  border-radius: 12px;
`;

const StyledPicture = styled.div`
  background: #2e3138;
  width: 50px;
  height: 42px;
  margin-right: 16px;
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledListing = styled.div`
  font-size: 16px;
  font-weight: bold;
`;

const StyledDetails = styled.div`
  font-size: 12px;
  color: #2e3138;
`;

function Booking({ booking }: OwnProps) {
  return (
    <StyledBooking>
      <StyledLabel>
        {booking.time} · {booking.user} booked a trip
      </StyledLabel>
      <StyledContainer>
        <StyledPicture />
        <StyledContent>
          <StyledListing>{booking.listing}</StyledListing>
          <StyledDetails>
            {booking.dateRange} · {booking.nights} nights · {booking.guests}{' '}
            guests · {booking.price}
          </StyledDetails>
        </StyledContent>
      </StyledContainer>
    </StyledBooking>
  );
}

export default Booking;
