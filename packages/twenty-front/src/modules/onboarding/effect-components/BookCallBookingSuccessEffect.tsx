import { getCalApi } from '@calcom/embed-react';
import { useEffect } from 'react';

type BookCallBookingSuccessEffectProps = {
  onBookingSuccessful: () => void;
};

export const BookCallBookingSuccessEffect = ({
  onBookingSuccessful,
}: BookCallBookingSuccessEffectProps) => {
  useEffect(() => {
    let isSubscribed = true;
    let hasHandledBookingSuccess = false;
    let calApi: Awaited<ReturnType<typeof getCalApi>> | undefined;

    const handleBookingSuccessful = () => {
      if (hasHandledBookingSuccess) {
        return;
      }

      hasHandledBookingSuccess = true;
      onBookingSuccessful();
    };

    const subscribeToBookingSuccess = async () => {
      const api = await getCalApi();

      if (!isSubscribed) {
        return;
      }

      calApi = api;
      api('on', {
        action: 'bookingSuccessfulV2',
        callback: handleBookingSuccessful,
      });
    };

    void subscribeToBookingSuccess();

    return () => {
      isSubscribed = false;
      calApi?.('off', {
        action: 'bookingSuccessfulV2',
        callback: handleBookingSuccessful,
      });
    };
  }, [onBookingSuccessful]);

  return null;
};
