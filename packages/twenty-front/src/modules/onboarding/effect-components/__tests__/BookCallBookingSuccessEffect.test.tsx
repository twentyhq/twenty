import { act, render } from '@testing-library/react';

import { BookCallBookingSuccessEffect } from '@/onboarding/effect-components/BookCallBookingSuccessEffect';

const mockCalApi = jest.fn();

jest.mock('@calcom/embed-react', () => ({
  getCalApi: () => Promise.resolve(mockCalApi),
}));

const renderEffect = async (onBookingSuccessful: () => void) => {
  const view = render(
    <BookCallBookingSuccessEffect onBookingSuccessful={onBookingSuccessful} />,
  );

  await act(async () => {
    await Promise.resolve();
  });

  const subscription = mockCalApi.mock.calls.find(
    ([action]) => action === 'on',
  );

  return {
    view,
    emitBookingSuccessful: subscription?.[1].callback as () => void,
  };
};

describe('BookCallBookingSuccessEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should subscribe to the booking success event', async () => {
    const onBookingSuccessful = jest.fn();

    const { emitBookingSuccessful } = await renderEffect(onBookingSuccessful);

    expect(emitBookingSuccessful).toBeDefined();
  });

  it('should notify once even when the embed emits repeatedly', async () => {
    const onBookingSuccessful = jest.fn();

    const { emitBookingSuccessful } = await renderEffect(onBookingSuccessful);

    act(() => {
      emitBookingSuccessful();
      emitBookingSuccessful();
    });

    expect(onBookingSuccessful).toHaveBeenCalledTimes(1);
  });

  it('should unsubscribe on unmount so listeners cannot stack up', async () => {
    const onBookingSuccessful = jest.fn();

    const { view } = await renderEffect(onBookingSuccessful);

    view.unmount();

    expect(mockCalApi).toHaveBeenCalledWith(
      'off',
      expect.objectContaining({ action: 'bookingSuccessfulV2' }),
    );
  });
});
