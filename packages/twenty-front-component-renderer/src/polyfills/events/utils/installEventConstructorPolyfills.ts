import { createInputEventClass } from '@/polyfills/events/utils/createInputEventClass';
import { createKeyboardEventClass } from '@/polyfills/events/utils/createKeyboardEventClass';
import { createMouseEventClass } from '@/polyfills/events/utils/createMouseEventClass';
import { createPointerEventClass } from '@/polyfills/events/utils/createPointerEventClass';
import { createUiEventClass } from '@/polyfills/events/utils/createUiEventClass';
import { createWheelEventClass } from '@/polyfills/events/utils/createWheelEventClass';
import { resolveBaseEventClass } from '@/polyfills/events/utils/resolveBaseEventClass';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';

type InstallEventConstructorPolyfillsInput = {
  globalScope: Record<string, unknown>;
};

export const installEventConstructorPolyfills = ({
  globalScope,
}: InstallEventConstructorPolyfillsInput): void => {
  const UIEventImplementation = createUiEventClass(
    resolveBaseEventClass(globalScope),
  );
  const MouseEventImplementation = createMouseEventClass(UIEventImplementation);

  const eventClassByName = {
    UIEvent: UIEventImplementation,
    MouseEvent: MouseEventImplementation,
    PointerEvent: createPointerEventClass(MouseEventImplementation),
    WheelEvent: createWheelEventClass(MouseEventImplementation),
    KeyboardEvent: createKeyboardEventClass(UIEventImplementation),
    InputEvent: createInputEventClass(UIEventImplementation),
  };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    for (const [eventClassName, eventClass] of Object.entries(
      eventClassByName,
    )) {
      if (eventClassName in installTarget) {
        continue;
      }

      Object.defineProperty(installTarget, eventClassName, {
        value: eventClass,
        configurable: true,
        writable: true,
      });
    }
  }
};
