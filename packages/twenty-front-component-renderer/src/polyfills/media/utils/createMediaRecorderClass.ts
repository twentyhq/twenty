import { isDefined } from 'twenty-shared/utils';

import { type WorkerMediaBridge } from '@/polyfills/media/types/WorkerMediaBridge';
import { createDomException } from '@/polyfills/media/utils/createDomException';
import { type WorkerMediaStreamInstance } from '@/polyfills/media/utils/createMediaStreamClass';

export type WorkerMediaRecorderState = 'inactive' | 'recording' | 'paused';

export type WorkerMediaRecorderDataEvent = Event & { data: Blob };

export type WorkerMediaRecorderErrorEvent = Event & { error: Error };

type CreateMediaRecorderClassInput = {
  bridge: WorkerMediaBridge;
  isMediaStreamInstance: (stream: unknown) => stream is WorkerMediaStreamInstance;
  resolveCapturedStreamId: (stream: object) => string | null;
};

type WorkerMediaRecorderOptions = {
  mimeType?: string;
};

const createRecorderDataEvent = (data: Blob): WorkerMediaRecorderDataEvent => {
  const dataEvent = new Event('dataavailable') as WorkerMediaRecorderDataEvent;

  Object.defineProperty(dataEvent, 'data', { value: data });

  return dataEvent;
};

const createRecorderErrorEvent = (
  error: Error,
): WorkerMediaRecorderErrorEvent => {
  const errorEvent = new Event('error') as WorkerMediaRecorderErrorEvent;

  Object.defineProperty(errorEvent, 'error', { value: error });

  return errorEvent;
};

export const createMediaRecorderClass = ({
  bridge,
  isMediaStreamInstance,
  resolveCapturedStreamId,
}: CreateMediaRecorderClassInput) => {
  class MediaRecorderImplementation extends EventTarget {
    readonly stream: WorkerMediaStreamInstance;

    #state: WorkerMediaRecorderState = 'inactive';
    #mimeType: string;
    #recorderId: string | null = null;
    // A stop or pause can land while the start round trip is still in
    // flight; it is applied as soon as the host recorder id is known.
    #hasPendingStopRequest = false;
    #hasPendingPauseRequest = false;

    #eventHandlers = new Map<string, EventListener>();

    static isTypeSupported(mimeType: string): boolean {
      return bridge.isRecorderMimeTypeSupported(String(mimeType));
    }

    constructor(
      stream: WorkerMediaStreamInstance,
      options?: WorkerMediaRecorderOptions,
    ) {
      super();

      if (!isMediaStreamInstance(stream)) {
        throw new TypeError(
          "Failed to construct 'MediaRecorder': parameter 1 is not of type 'MediaStream'",
        );
      }

      const requestedMimeType = options?.mimeType ?? '';

      if (
        requestedMimeType !== '' &&
        !bridge.isRecorderMimeTypeSupported(requestedMimeType)
      ) {
        throw createDomException(
          `Failed to construct 'MediaRecorder': Failed to initialize native MediaRecorder the type provided (${requestedMimeType}) is not supported`,
          'NotSupportedError',
        );
      }

      this.stream = stream;
      this.#mimeType = requestedMimeType;
    }

    get state(): WorkerMediaRecorderState {
      return this.#state;
    }

    get mimeType(): string {
      return this.#mimeType;
    }

    get ondataavailable(): EventListener | null {
      return this.#getEventHandler('dataavailable');
    }

    set ondataavailable(handler: EventListener | null) {
      this.#setEventHandler('dataavailable', handler);
    }

    get onstart(): EventListener | null {
      return this.#getEventHandler('start');
    }

    set onstart(handler: EventListener | null) {
      this.#setEventHandler('start', handler);
    }

    get onstop(): EventListener | null {
      return this.#getEventHandler('stop');
    }

    set onstop(handler: EventListener | null) {
      this.#setEventHandler('stop', handler);
    }

    get onerror(): EventListener | null {
      return this.#getEventHandler('error');
    }

    set onerror(handler: EventListener | null) {
      this.#setEventHandler('error', handler);
    }

    get onpause(): EventListener | null {
      return this.#getEventHandler('pause');
    }

    set onpause(handler: EventListener | null) {
      this.#setEventHandler('pause', handler);
    }

    get onresume(): EventListener | null {
      return this.#getEventHandler('resume');
    }

    set onresume(handler: EventListener | null) {
      this.#setEventHandler('resume', handler);
    }

    start(timesliceMs?: number): void {
      if (this.#state !== 'inactive') {
        throw createDomException(
          "Failed to execute 'start' on 'MediaRecorder': The MediaRecorder's state is not 'inactive'",
          'InvalidStateError',
        );
      }

      if (!this.stream.active) {
        throw createDomException(
          "Failed to execute 'start' on 'MediaRecorder': The MediaStream is inactive",
          'InvalidStateError',
        );
      }

      const capturedStreamId = resolveCapturedStreamId(this.stream);

      if (!isDefined(capturedStreamId)) {
        throw createDomException(
          "Failed to execute 'start' on 'MediaRecorder': Only streams returned by getUserMedia can be recorded in this environment",
          'NotSupportedError',
        );
      }

      this.#state = 'recording';
      this.#hasPendingStopRequest = false;
      this.#hasPendingPauseRequest = false;

      bridge
        .startRecorder({
          streamId: capturedStreamId,
          mimeType: this.#mimeType === '' ? undefined : this.#mimeType,
          timesliceMs,
          handlers: {
            onData: (data) => this.dispatchEvent(createRecorderDataEvent(data)),
            onStop: () => this.#handleHostStop(),
            onError: (errorMessage) =>
              this.dispatchEvent(
                createRecorderErrorEvent(
                  createDomException(errorMessage, 'UnknownError'),
                ),
              ),
          },
        })
        .then((result) => {
          if (result.status === 'failed') {
            this.#state = 'inactive';
            this.dispatchEvent(
              createRecorderErrorEvent(
                createDomException(result.errorMessage, result.errorName),
              ),
            );
            return;
          }

          this.#recorderId = result.recorderId;
          this.#mimeType = result.mimeType;
          this.dispatchEvent(new Event('start'));

          if (this.#hasPendingStopRequest) {
            this.#hasPendingStopRequest = false;
            bridge.stopRecorder(result.recorderId);
            return;
          }

          if (this.#hasPendingPauseRequest) {
            this.#hasPendingPauseRequest = false;
            bridge.pauseRecorder(result.recorderId);
          }
        });
    }

    stop(): void {
      if (this.#state === 'inactive') {
        throw createDomException(
          "Failed to execute 'stop' on 'MediaRecorder': The MediaRecorder's state is 'inactive'",
          'InvalidStateError',
        );
      }

      this.#state = 'inactive';

      if (isDefined(this.#recorderId)) {
        bridge.stopRecorder(this.#recorderId);
        return;
      }

      this.#hasPendingStopRequest = true;
    }

    pause(): void {
      if (this.#state === 'inactive') {
        throw createDomException(
          "Failed to execute 'pause' on 'MediaRecorder': The MediaRecorder's state is 'inactive'",
          'InvalidStateError',
        );
      }

      if (this.#state === 'paused') {
        return;
      }

      this.#state = 'paused';
      this.dispatchEvent(new Event('pause'));

      if (isDefined(this.#recorderId)) {
        bridge.pauseRecorder(this.#recorderId);
        return;
      }

      this.#hasPendingPauseRequest = true;
    }

    resume(): void {
      if (this.#state === 'inactive') {
        throw createDomException(
          "Failed to execute 'resume' on 'MediaRecorder': The MediaRecorder's state is 'inactive'",
          'InvalidStateError',
        );
      }

      if (this.#state === 'recording') {
        return;
      }

      this.#state = 'recording';
      this.#hasPendingPauseRequest = false;
      this.dispatchEvent(new Event('resume'));

      if (isDefined(this.#recorderId)) {
        bridge.resumeRecorder(this.#recorderId);
      }
    }

    requestData(): void {
      if (this.#state === 'inactive') {
        throw createDomException(
          "Failed to execute 'requestData' on 'MediaRecorder': The MediaRecorder's state is 'inactive'",
          'InvalidStateError',
        );
      }

      if (isDefined(this.#recorderId)) {
        bridge.requestRecorderData(this.#recorderId);
      }
    }

    #handleHostStop(): void {
      this.#recorderId = null;
      this.#state = 'inactive';
      this.dispatchEvent(new Event('stop'));
    }

    #getEventHandler(eventType: string): EventListener | null {
      return this.#eventHandlers.get(eventType) ?? null;
    }

    #setEventHandler(eventType: string, handler: EventListener | null): void {
      const previousHandler = this.#eventHandlers.get(eventType);

      if (isDefined(previousHandler)) {
        this.removeEventListener(eventType, previousHandler);
        this.#eventHandlers.delete(eventType);
      }

      if (handler !== null) {
        this.#eventHandlers.set(eventType, handler);
        this.addEventListener(eventType, handler);
      }
    }
  }

  return { MediaRecorderImplementation };
};
