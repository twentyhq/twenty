import { type WorkerEventConstructor } from '@/polyfills/events/types/WorkerEventConstructor';

export const createUiEventClass = (baseEventClass: WorkerEventConstructor) =>
  class UIEventImplementation extends baseEventClass {
    readonly view = null;
    readonly detail: number;
    readonly which: number;

    constructor(type: string, eventInit: UIEventInit = {}) {
      super(type, eventInit);

      this.detail = eventInit.detail ?? 0;
      this.which = eventInit.which ?? 0;
    }
  };
