import { isDefined } from 'twenty-shared/utils';

import { type WorkerMediaBridge } from '@/polyfills/media/types/WorkerMediaBridge';
import { createDomException } from '@/polyfills/media/utils/createDomException';
import { createMediaRecorderClass } from '@/polyfills/media/utils/createMediaRecorderClass';
import {
  createMediaStreamClass,
  type WorkerMediaStreamInstance,
} from '@/polyfills/media/utils/createMediaStreamClass';
import { createMediaStreamTrackClass } from '@/polyfills/media/utils/createMediaStreamTrackClass';
import { resolveGlobalScopeInstallTargets } from '@/polyfills/utils/resolveGlobalScopeInstallTargets';
import { type MediaSessionMediaType } from '@/types/MediaSession';

type InstallMediaCapturePolyfillsInput = {
  globalScope: Record<string, unknown>;
  bridge: WorkerMediaBridge;
};

type UserMediaConstraints = {
  audio?: unknown;
  video?: unknown;
};

type NavigatorWithMediaDevices = {
  mediaDevices?: unknown;
};

export const installMediaCapturePolyfills = ({
  globalScope,
  bridge,
}: InstallMediaCapturePolyfillsInput): void => {
  const { MediaStreamTrackImplementation, instantiateMediaStreamTrack } =
    createMediaStreamTrackClass({ bridge });

  const {
    MediaStreamImplementation,
    instantiateCapturedMediaStream,
    resolveCapturedStreamId,
  } = createMediaStreamClass();

  const { MediaRecorderImplementation } = createMediaRecorderClass({
    bridge,
    isMediaStreamInstance: (stream): stream is WorkerMediaStreamInstance =>
      stream instanceof MediaStreamImplementation,
    resolveCapturedStreamId,
  });

  const getUserMedia = async (
    constraints?: UserMediaConstraints,
  ): Promise<WorkerMediaStreamInstance> => {
    const isAudioRequested = Boolean(constraints?.audio);
    const isVideoRequested = Boolean(constraints?.video);

    if (!isAudioRequested && !isVideoRequested) {
      throw new TypeError(
        "Failed to execute 'getUserMedia' on 'MediaDevices': At least one of audio and video must be requested",
      );
    }

    // Detailed constraint objects (deviceId, resolution, ...) are accepted
    // but not forwarded: the host captures with its defaults.
    const mediaType: MediaSessionMediaType = isVideoRequested
      ? 'video'
      : 'audio';

    const startStreamResult = await bridge.startStream({ mediaType });

    if (startStreamResult.status === 'failed') {
      throw createDomException(
        startStreamResult.errorMessage,
        startStreamResult.errorName,
      );
    }

    const tracks = startStreamResult.tracks.map((trackDescriptor) =>
      instantiateMediaStreamTrack({
        streamId: startStreamResult.streamId,
        trackId: trackDescriptor.trackId,
        kind: trackDescriptor.kind,
      }),
    );

    return instantiateCapturedMediaStream({
      streamId: startStreamResult.streamId,
      tracks,
    });
  };

  const mediaDevices = { getUserMedia };

  for (const installTarget of resolveGlobalScopeInstallTargets(globalScope)) {
    installTarget.MediaStream = MediaStreamImplementation;
    installTarget.MediaStreamTrack = MediaStreamTrackImplementation;
    installTarget.MediaRecorder = MediaRecorderImplementation;

    const targetNavigator = (installTarget.navigator ??
      globalScope.navigator) as NavigatorWithMediaDevices | undefined;

    if (!isDefined(targetNavigator)) {
      installTarget.navigator = { mediaDevices };
      continue;
    }

    installTarget.navigator ??= targetNavigator;

    // The worker's own navigator is a platform object whose mediaDevices
    // does not exist; define it without clobbering anything already there.
    if (!isDefined(targetNavigator.mediaDevices)) {
      Object.defineProperty(targetNavigator, 'mediaDevices', {
        configurable: true,
        value: mediaDevices,
      });
    }
  }
};
