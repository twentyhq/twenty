import { type PointerEvent } from 'react';

import { createHostPointerCaptureControllerStub } from '@/testing/createHostPointerCaptureControllerStub';

import { createSliderPointerCaptureProps } from '../createSliderPointerCaptureProps';

const dragSurfaces = new WeakSet<Element>();

const createPressedElement = ({
  isDragSurface,
  hasRangeInput = true,
  isRangeInputDisabled = false,
}: {
  isDragSurface: boolean;
  hasRangeInput?: boolean;
  isRangeInputDisabled?: boolean;
}) => {
  const element = Object.assign(document.createElement('div'), {
    setPointerCapture: jest.fn(),
  });

  if (isDragSurface) {
    dragSurfaces.add(element);
  }

  if (hasRangeInput) {
    const thumb = document.createElement('div');
    const input = document.createElement('input');

    input.type = 'range';
    input.disabled = isRangeInputDisabled;
    thumb.append(input);
    element.append(thumb);
  }

  document.body.append(element);

  return element;
};

const createPointerPress = ({
  element,
  isTrusted = true,
  pointerId = 1,
  nativeEvent = { isTrusted },
}: {
  element: HTMLElement;
  isTrusted?: boolean;
  pointerId?: number;
  nativeEvent?: { isTrusted: boolean };
}) =>
  ({
    currentTarget: element,
    pointerId,
    button: 0,
    defaultPrevented: false,
    nativeEvent,
  }) as unknown as PointerEvent<HTMLElement>;

const createPointerDownHandler = (
  pointerCaptureController = createHostPointerCaptureControllerStub(),
) => {
  const remotePointerDown = jest.fn();
  const handler = createSliderPointerCaptureProps({
    reactBindableProps: { onPointerDown: remotePointerDown },
    pointerCaptureController,
  })!.onPointerDown as (event: PointerEvent<HTMLElement>) => void;

  return { handler, remotePointerDown, pointerCaptureController };
};

describe('createSliderPointerCaptureProps', () => {
  beforeEach(() => {
    jest.spyOn(window, 'getComputedStyle').mockImplementation(
      (element) =>
        ({
          getPropertyValue: (propertyName: string) =>
            propertyName === 'touch-action' && dragSurfaces.has(element)
              ? 'none'
              : 'auto',
        }) as CSSStyleDeclaration,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
    document.body.replaceChildren();
  });

  it('should capture trusted presses on an enabled slider control', () => {
    const { handler, remotePointerDown, pointerCaptureController } =
      createPointerDownHandler();
    const control = createPressedElement({ isDragSurface: true });
    const disabledControl = createPressedElement({
      isDragSurface: true,
      isRangeInputDisabled: true,
    });

    handler(createPointerPress({ element: control, isTrusted: false }));
    handler(createPointerPress({ element: disabledControl }));

    expect(control.setPointerCapture).not.toHaveBeenCalled();
    expect(disabledControl.setPointerCapture).not.toHaveBeenCalled();
    expect(pointerCaptureController.startPointerCapture).not.toHaveBeenCalled();

    handler(createPointerPress({ element: control, pointerId: 0 }));

    expect(control.setPointerCapture).toHaveBeenCalledWith(0);
    expect(pointerCaptureController.startPointerCapture).toHaveBeenCalledWith({
      element: control,
      pointerId: 0,
    });
    expect(remotePointerDown).toHaveBeenCalledTimes(3);
  });

  it('should leave elements that are not slider controls on their ordinary pointer path', () => {
    const { handler, remotePointerDown, pointerCaptureController } =
      createPointerDownHandler();
    const sliderParent = createPressedElement({ isDragSurface: false });
    const otherDragSurface = createPressedElement({
      isDragSurface: true,
      hasRangeInput: false,
    });

    handler(createPointerPress({ element: sliderParent }));
    handler(createPointerPress({ element: otherDragSurface }));

    expect(sliderParent.setPointerCapture).not.toHaveBeenCalled();
    expect(otherDragSurface.setPointerCapture).not.toHaveBeenCalled();
    expect(pointerCaptureController.startPointerCapture).not.toHaveBeenCalled();
    expect(remotePointerDown).toHaveBeenCalledTimes(2);
  });

  it('should start one capture session for a press that reaches nested slider controls', () => {
    const { handler, pointerCaptureController } = createPointerDownHandler();
    const innerControl = createPressedElement({ isDragSurface: true });
    const outerControl = createPressedElement({ isDragSurface: true });
    const nativeEvent = { isTrusted: true };

    handler(createPointerPress({ element: innerControl, nativeEvent }));
    handler(createPointerPress({ element: outerControl, nativeEvent }));

    expect(innerControl.setPointerCapture).toHaveBeenCalledWith(1);
    expect(outerControl.setPointerCapture).not.toHaveBeenCalled();
    expect(pointerCaptureController.startPointerCapture).toHaveBeenCalledTimes(
      1,
    );
  });

  it('should keep separators and renderers without a capture controller on their existing paths', () => {
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: { role: 'separator', onPointerDown: jest.fn() },
        pointerCaptureController: createHostPointerCaptureControllerStub(),
      }),
    ).toBeUndefined();
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: { onPointerDown: jest.fn() },
        pointerCaptureController: null,
      }),
    ).toBeUndefined();
    expect(
      createSliderPointerCaptureProps({
        reactBindableProps: {},
        pointerCaptureController: createHostPointerCaptureControllerStub(),
      }),
    ).toBeUndefined();
  });
});
