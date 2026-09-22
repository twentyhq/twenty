export type WorkerEventConstructor = new (
  type: string,
  eventInit?: EventInit,
) => Event;
