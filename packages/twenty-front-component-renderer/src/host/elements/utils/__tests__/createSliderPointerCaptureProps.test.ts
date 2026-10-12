import { type PointerEvent } from 'react';

import { createSliderPointerCaptureProps } from '../createSliderPointerCaptureProps';

const createPointerPress = ({
  isTrusted,
  isDisabled = false,
}: {
  isTrusted: boolean;
  isDisabled?: boolean;
}) => {
  const element = Object.assign(document.createElement('div'), {
    setPointerCapture: jest.fn(),
  });
  const input = document.createElement('input');

  input.type = 'range';
  input.disabled = isDisabled;
  element.append(input);

  return {
    element,
    event: {
      currentTarget: element,
      pointerId: 1,
      button: 0,
      defaultPrevented: false,
      nativeEvent: { isTrusted },
    } as unknown as PointerEvent<HTMLElement>,
  };
};

describe('createSliderPointerCaptureProps', () => {
  it('should capture only trusted presses on an enabled slider control', () => {
    const remotePointerDown = jest.fn();
    const handler = createSliderPointerCaptureProps({
      onPointerDown: remotePointerDown,
    })!.onPointerDown as (event: PointerEvent<HTMLElement>) => void;
    const untrustedPress = createPointerPress({ isTrusted: false });

    handler(untrustedPress.event);
    expect(untrustedPress.element.setPointerCapture).not.toHaveBeenCalled();
    const disabledPress = createPointerPress({
      isTrusted: true,
      isDisabled: true,
    });

    handler(disabledPress.event);
    expect(disabledPress.element.setPointerCapture).not.toHaveBeenCalled();
    const trustedPress = createPointerPress({ isTrusted: true });

    handler(trustedPress.event);
    expect(trustedPress.element.setPointerCapture).toHaveBeenCalledWith(1);
    expect(remotePointerDown).toHaveBeenCalledTimes(3);
  });

  it('should preserve the existing separator capture path', () => {
    expect(
      createSliderPointerCaptureProps({
        role: 'separator',
        onPointerDown: jest.fn(),
      }),
    ).toBeUndefined();
  });
});
