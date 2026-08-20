import { type WorkerMediaBridge } from '@/polyfills/media/types/WorkerMediaBridge';
import { type MediaSessionMediaType } from '@/types/MediaSession';

type CreateMediaStreamTrackClassInput = {
  bridge: WorkerMediaBridge;
};

export type WorkerMediaStreamTrackInit = {
  streamId: string;
  trackId: string;
  kind: MediaSessionMediaType;
};

export type WorkerMediaStreamTrackInstance = EventTarget & {
  readonly id: string;
  readonly kind: MediaSessionMediaType;
  readonly label: string;
  readonly readyState: 'live' | 'ended';
  enabled: boolean;
  onended: ((event: Event) => void) | null;
  stop: () => void;
};

export const createMediaStreamTrackClass = ({
  bridge,
}: CreateMediaStreamTrackClassInput) => {
  const constructionKey = Symbol('workerMediaStreamTrackConstruction');

  class MediaStreamTrackImplementation
    extends EventTarget
    implements WorkerMediaStreamTrackInstance
  {
    readonly id: string;
    readonly kind: MediaSessionMediaType;
    readonly label = '';

    #streamId: string;
    #readyState: 'live' | 'ended' = 'live';
    #enabled = true;
    #onended: ((event: Event) => void) | null = null;

    constructor(key: symbol, init: WorkerMediaStreamTrackInit) {
      super();

      // Real tracks only come from capture calls; direct construction is not
      // meaningful, which is also what native implementations enforce.
      if (key !== constructionKey) {
        throw new TypeError('Illegal constructor');
      }

      this.id = init.trackId;
      this.kind = init.kind;
      this.#streamId = init.streamId;

      bridge.registerTrackEventHandlers({
        streamId: init.streamId,
        trackId: init.trackId,
        handlers: {
          onEnded: () => this.#handleHostEnded(),
        },
      });
    }

    get readyState(): 'live' | 'ended' {
      return this.#readyState;
    }

    get enabled(): boolean {
      return this.#enabled;
    }

    set enabled(enabled: boolean) {
      const nextEnabled = Boolean(enabled);

      if (this.#enabled === nextEnabled) {
        return;
      }

      this.#enabled = nextEnabled;

      if (this.#readyState === 'live') {
        bridge.setStreamTrackEnabled({
          streamId: this.#streamId,
          trackId: this.id,
          enabled: nextEnabled,
        });
      }
    }

    get onended(): ((event: Event) => void) | null {
      return this.#onended;
    }

    set onended(handler: ((event: Event) => void) | null) {
      if (this.#onended !== null) {
        this.removeEventListener('ended', this.#onended);
      }

      this.#onended = handler;

      if (handler !== null) {
        this.addEventListener('ended', handler);
      }
    }

    stop(): void {
      if (this.#readyState === 'ended') {
        return;
      }

      // Native stop() flips readyState synchronously and fires no ended
      // event: that event is reserved for externally caused endings.
      this.#readyState = 'ended';

      bridge.stopStreamTrack({ streamId: this.#streamId, trackId: this.id });
    }

    #handleHostEnded(): void {
      if (this.#readyState === 'ended') {
        return;
      }

      this.#readyState = 'ended';
      this.dispatchEvent(new Event('ended'));
    }
  }

  const instantiateMediaStreamTrack = (
    init: WorkerMediaStreamTrackInit,
  ): WorkerMediaStreamTrackInstance =>
    new MediaStreamTrackImplementation(constructionKey, init);

  return { MediaStreamTrackImplementation, instantiateMediaStreamTrack };
};
