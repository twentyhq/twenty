import { type createUiEventClass } from '@/polyfills/events/utils/createUiEventClass';
import { resolveModifierKeyState } from '@/polyfills/events/utils/resolveModifierKeyState';

export const createKeyboardEventClass = (
  uiEventClass: ReturnType<typeof createUiEventClass>,
) =>
  class KeyboardEventImplementation extends uiEventClass {
    static readonly DOM_KEY_LOCATION_STANDARD = 0;
    static readonly DOM_KEY_LOCATION_LEFT = 1;
    static readonly DOM_KEY_LOCATION_RIGHT = 2;
    static readonly DOM_KEY_LOCATION_NUMPAD = 3;

    readonly key: string;
    readonly code: string;
    readonly location: number;
    readonly repeat: boolean;
    readonly isComposing: boolean;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly charCode: number;
    readonly keyCode: number;

    constructor(type: string, eventInit: KeyboardEventInit = {}) {
      super(type, eventInit);

      this.key = eventInit.key ?? '';
      this.code = eventInit.code ?? '';
      this.location = eventInit.location ?? 0;
      this.repeat = eventInit.repeat ?? false;
      this.isComposing = eventInit.isComposing ?? false;
      this.ctrlKey = eventInit.ctrlKey ?? false;
      this.shiftKey = eventInit.shiftKey ?? false;
      this.altKey = eventInit.altKey ?? false;
      this.metaKey = eventInit.metaKey ?? false;
      this.charCode = eventInit.charCode ?? 0;
      this.keyCode = eventInit.keyCode ?? 0;
    }

    getModifierState(keyArgument: string): boolean {
      return resolveModifierKeyState(this, keyArgument);
    }
  };
