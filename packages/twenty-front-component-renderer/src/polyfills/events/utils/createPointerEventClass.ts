import { type createMouseEventClass } from '@/polyfills/events/utils/createMouseEventClass';

export const createPointerEventClass = (
  mouseEventClass: ReturnType<typeof createMouseEventClass>,
) =>
  class PointerEventImplementation extends mouseEventClass {
    readonly pointerId: number;
    readonly width: number;
    readonly height: number;
    readonly pressure: number;
    readonly tangentialPressure: number;
    readonly tiltX: number;
    readonly tiltY: number;
    readonly twist: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;

    constructor(type: string, eventInit: PointerEventInit = {}) {
      super(type, eventInit);

      this.pointerId = eventInit.pointerId ?? 0;
      this.width = eventInit.width ?? 1;
      this.height = eventInit.height ?? 1;
      this.pressure = eventInit.pressure ?? 0;
      this.tangentialPressure = eventInit.tangentialPressure ?? 0;
      this.tiltX = eventInit.tiltX ?? 0;
      this.tiltY = eventInit.tiltY ?? 0;
      this.twist = eventInit.twist ?? 0;
      this.pointerType = eventInit.pointerType ?? '';
      this.isPrimary = eventInit.isPrimary ?? false;
    }

    getCoalescedEvents(): Event[] {
      return [];
    }

    getPredictedEvents(): Event[] {
      return [];
    }
  };
