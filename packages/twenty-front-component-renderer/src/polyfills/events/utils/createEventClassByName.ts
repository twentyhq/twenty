import { type WorkerEventConstructor } from '@/polyfills/events/types/WorkerEventConstructor';
import { createInputEventClass } from '@/polyfills/events/utils/createInputEventClass';
import { createKeyboardEventClass } from '@/polyfills/events/utils/createKeyboardEventClass';
import { createMouseEventClass } from '@/polyfills/events/utils/createMouseEventClass';
import { createPointerEventClass } from '@/polyfills/events/utils/createPointerEventClass';
import { createUiEventClass } from '@/polyfills/events/utils/createUiEventClass';
import { createWheelEventClass } from '@/polyfills/events/utils/createWheelEventClass';

export const createEventClassByName = (
  baseEventClass: WorkerEventConstructor,
) => {
  const UIEventImplementation = createUiEventClass(baseEventClass);
  const MouseEventImplementation = createMouseEventClass(UIEventImplementation);

  return {
    UIEvent: UIEventImplementation,
    MouseEvent: MouseEventImplementation,
    PointerEvent: createPointerEventClass(MouseEventImplementation),
    WheelEvent: createWheelEventClass(MouseEventImplementation),
    KeyboardEvent: createKeyboardEventClass(UIEventImplementation),
    InputEvent: createInputEventClass(UIEventImplementation),
  };
};
