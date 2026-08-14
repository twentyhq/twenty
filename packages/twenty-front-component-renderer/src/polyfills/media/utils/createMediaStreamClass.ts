import { type WorkerMediaStreamTrackInstance } from '@/polyfills/media/utils/createMediaStreamTrackClass';
import { generateRandomId } from '@/utils/generateRandomId';

export type WorkerMediaStreamInstance = EventTarget & {
  readonly id: string;
  readonly active: boolean;
  getTracks: () => WorkerMediaStreamTrackInstance[];
  getAudioTracks: () => WorkerMediaStreamTrackInstance[];
  getVideoTracks: () => WorkerMediaStreamTrackInstance[];
  getTrackById: (trackId: string) => WorkerMediaStreamTrackInstance | null;
  addTrack: (track: WorkerMediaStreamTrackInstance) => void;
  removeTrack: (track: WorkerMediaStreamTrackInstance) => void;
};

const generateLocalMediaStreamId = (): string =>
  `local-media-stream-${generateRandomId()}`;

export const createMediaStreamClass = () => {
  const capturedStreamIds = new WeakMap<object, string>();

  class MediaStreamImplementation
    extends EventTarget
    implements WorkerMediaStreamInstance
  {
    readonly id: string;

    #tracks: WorkerMediaStreamTrackInstance[] = [];

    constructor(
      streamOrTracks?:
        | MediaStreamImplementation
        | WorkerMediaStreamTrackInstance[],
    ) {
      super();

      if (streamOrTracks instanceof MediaStreamImplementation) {
        this.#tracks = [...streamOrTracks.getTracks()];
      } else if (Array.isArray(streamOrTracks)) {
        this.#tracks = [...streamOrTracks];
      }

      this.id = generateLocalMediaStreamId();
    }

    get active(): boolean {
      return this.#tracks.some((track) => track.readyState === 'live');
    }

    getTracks(): WorkerMediaStreamTrackInstance[] {
      return [...this.#tracks];
    }

    getAudioTracks(): WorkerMediaStreamTrackInstance[] {
      return this.#tracks.filter((track) => track.kind === 'audio');
    }

    getVideoTracks(): WorkerMediaStreamTrackInstance[] {
      return this.#tracks.filter((track) => track.kind === 'video');
    }

    getTrackById(trackId: string): WorkerMediaStreamTrackInstance | null {
      return this.#tracks.find((track) => track.id === trackId) ?? null;
    }

    addTrack(track: WorkerMediaStreamTrackInstance): void {
      if (this.#tracks.includes(track)) {
        return;
      }

      this.#tracks.push(track);
    }

    removeTrack(track: WorkerMediaStreamTrackInstance): void {
      this.#tracks = this.#tracks.filter(
        (existingTrack) => existingTrack !== track,
      );
    }
  }

  // Captured streams keep their host streamId out of band: the public id
  // stays a local value while the recorder resolves the host session id.
  const instantiateCapturedMediaStream = ({
    streamId,
    tracks,
  }: {
    streamId: string;
    tracks: WorkerMediaStreamTrackInstance[];
  }): WorkerMediaStreamInstance => {
    const capturedStream = new MediaStreamImplementation(tracks);

    capturedStreamIds.set(capturedStream, streamId);

    return capturedStream;
  };

  const resolveCapturedStreamId = (stream: object): string | null =>
    capturedStreamIds.get(stream) ?? null;

  return {
    MediaStreamImplementation,
    instantiateCapturedMediaStream,
    resolveCapturedStreamId,
  };
};
