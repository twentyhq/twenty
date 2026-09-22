import { type createUiEventClass } from '@/polyfills/events/utils/createUiEventClass';

export const createInputEventClass = (
  uiEventClass: ReturnType<typeof createUiEventClass>,
) =>
  class InputEventImplementation extends uiEventClass {
    readonly data: string | null;
    readonly isComposing: boolean;
    readonly inputType: string;
    readonly dataTransfer = null;

    constructor(type: string, eventInit: InputEventInit = {}) {
      super(type, eventInit);

      this.data = eventInit.data ?? null;
      this.isComposing = eventInit.isComposing ?? false;
      this.inputType = eventInit.inputType ?? '';
    }

    getTargetRanges(): StaticRange[] {
      return [];
    }
  };
