import { type createUiEventClass } from '@/polyfills/events/utils/createUiEventClass';
import { resolveModifierKeyState } from '@/polyfills/events/utils/resolveModifierKeyState';

export const createMouseEventClass = (
  uiEventClass: ReturnType<typeof createUiEventClass>,
) =>
  class MouseEventImplementation extends uiEventClass {
    readonly screenX: number;
    readonly screenY: number;
    readonly clientX: number;
    readonly clientY: number;
    readonly x: number;
    readonly y: number;
    readonly pageX: number;
    readonly pageY: number;
    readonly offsetX: number = 0;
    readonly offsetY: number = 0;
    readonly movementX: number;
    readonly movementY: number;
    readonly ctrlKey: boolean;
    readonly shiftKey: boolean;
    readonly altKey: boolean;
    readonly metaKey: boolean;
    readonly button: number;
    readonly buttons: number;
    readonly relatedTarget: EventTarget | null;

    constructor(type: string, eventInit: MouseEventInit = {}) {
      super(type, eventInit);

      this.screenX = eventInit.screenX ?? 0;
      this.screenY = eventInit.screenY ?? 0;
      this.clientX = eventInit.clientX ?? 0;
      this.clientY = eventInit.clientY ?? 0;
      this.x = this.clientX;
      this.y = this.clientY;
      this.pageX = this.clientX;
      this.pageY = this.clientY;
      this.movementX = eventInit.movementX ?? 0;
      this.movementY = eventInit.movementY ?? 0;
      this.ctrlKey = eventInit.ctrlKey ?? false;
      this.shiftKey = eventInit.shiftKey ?? false;
      this.altKey = eventInit.altKey ?? false;
      this.metaKey = eventInit.metaKey ?? false;
      this.button = eventInit.button ?? 0;
      this.buttons = eventInit.buttons ?? 0;
      this.relatedTarget = eventInit.relatedTarget ?? null;
    }

    getModifierState(keyArgument: string): boolean {
      return resolveModifierKeyState(this, keyArgument);
    }
  };
