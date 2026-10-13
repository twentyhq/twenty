import { type PointerEvent } from 'react';

import { createHostPointerCaptureControllerStub } from '@/testing/createHostPointerCaptureControllerStub';

import { createSliderPointerCaptureProps } from '../createSliderPointerCaptureProps';

const createPointerPress = ({
  isTrusted,
  isDisabled = false,
  pointerId = 1,
}: {
  isTrusted: boolean;
  isDisabled?: boolean;
  pointerId?: number;
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
      pointerId,
      button: 0,
      defaultPrevented: false,
      nativeEvent: { isTrusted },
    } as unknown as PointerEvent<HTMLElement>,
  };
};

describe('createSliderPointerCaptureProps', () => {
  it('should capture and start a host capture session only for trusted presses on an enabled slider control', () => {
    const remotePointerDown = jest.fn();
    const pointerCaptureController = createHostPointerCaptureControllerStub();
    const handler = createSliderPointerCaptureProps({
      reactBindableProps: {
        'data-twenty-ui-slider-control': '',
        onPointerDown: remotePointerDown,
      },
      pointerCaptureController,
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
    expect(pointerCaptureController.startPointerCapture).not.toHaveBeenCalled();
    const trustedPress = createPointerPress({ isTrusted: true, pointerId: 0 });

    handler(trustedPress.event);
    expect(trustedPress.element.setPointerCapture).toHaveBeenCalledWith(0);
    expect(pointerCaptureController.startPointerCapture).toHaveBeenCalledWith({
      element: trustedPress.element,
      pointerId: 0,
    });
    expect(remotePointerDown).toHaveBeenCalledTimes(3);
  });

  it('should leave caller ancestors, slider thumbs and renderers without a capture controller on their ordinary pointer path', () => {
    const remotePointerDown = jest.fn();
    const pointerCaptureController = createHostPointerCaptureControllerStub();

    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: { onPointerDown: remotePointerDown },
        pointerCaptureController,
      }),
    ).toBeUndefined();
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: {
          'data-index': '0',
          onPointerDown: remotePointerDown,
        },
        pointerCaptureController,
      }),
    ).toBeUndefined();
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: {
          'data-twenty-ui-slider-control': '',
          onPointerDown: remotePointerDown,
        },
        pointerCaptureController: null,
      }),
    ).toBeUndefined();
  });

  it('should preserve the existing separator capture path', () => {
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: {
          'data-twenty-ui-slider-control': '',
          role: 'separator',
          onPointerDown: jest.fn(),
        },
        pointerCaptureController: createHostPointerCaptureControllerStub(),
      }),
    ).toBeUndefined();
  });
});
