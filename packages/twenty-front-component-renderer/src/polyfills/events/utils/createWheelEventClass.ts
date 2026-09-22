import { type createMouseEventClass } from '@/polyfills/events/utils/createMouseEventClass';

export const createWheelEventClass = (
  mouseEventClass: ReturnType<typeof createMouseEventClass>,
) =>
  class WheelEventImplementation extends mouseEventClass {
    static readonly DOM_DELTA_PIXEL = 0;
    static readonly DOM_DELTA_LINE = 1;
    static readonly DOM_DELTA_PAGE = 2;

    readonly deltaX: number;
    readonly deltaY: number;
    readonly deltaZ: number;
    readonly deltaMode: number;

    constructor(type: string, eventInit: WheelEventInit = {}) {
      super(type, eventInit);

      this.deltaX = eventInit.deltaX ?? 0;
      this.deltaY = eventInit.deltaY ?? 0;
      this.deltaZ = eventInit.deltaZ ?? 0;
      this.deltaMode = eventInit.deltaMode ?? 0;
    }
  };
