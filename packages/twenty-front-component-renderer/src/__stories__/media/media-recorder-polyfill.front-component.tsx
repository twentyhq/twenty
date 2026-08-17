import { useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

import { FrontComponentCard } from '@/__stories__/shared/front-components/front-component-card';
import {
  BUTTON_STYLE,
  STATUS_STYLE,
} from '@/__stories__/shared/front-components/styles';

// Deliberately uses only the standard web APIs — getUserMedia, MediaStream,
// MediaRecorder — the way a third-party recording library would. It only
// works if the media polyfills reached the real sandbox worker realm.
const MediaRecorderPolyfillFrontComponent = () => {
  const [status, setStatus] = useState('idle');

  const handleClick = async () => {
    try {
      if (typeof navigator.mediaDevices?.getUserMedia !== 'function') {
        setStatus('media:missing-get-user-media');

        return;
      }

      if (typeof MediaRecorder !== 'function') {
        setStatus('media:missing-media-recorder');

        return;
      }

      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        setStatus('media:missing-capability-snapshot');

        return;
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(mediaStream);
      const recordedChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        const dataEvent = event as Event & { data: Blob };

        recordedChunks.push(dataEvent.data);
      };

      const recordingStopped = new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
      });

      mediaRecorder.onstart = () => mediaRecorder.stop();
      mediaRecorder.start();

      await recordingStopped;

      for (const track of mediaStream.getTracks()) {
        track.stop();
      }

      const recordedBlob = new Blob(recordedChunks);

      setStatus(`media:captured:${recordedBlob.size}`);
    } catch (error) {
      setStatus(
        `media:error:${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  return (
    <FrontComponentCard title="media:media-recorder-polyfill">
      <button
        data-testid="subject"
        type="button"
        onClick={handleClick}
        style={BUTTON_STYLE}
      >
        Record
      </button>
      <span data-testid="api-status" style={STATUS_STYLE}>
        {status}
      </span>
    </FrontComponentCard>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-media-recorder-00000000-0000-0000-0000-000000000022',
  name: 'media-recorder-polyfill-front-component',
  description:
    'Front component covering the getUserMedia and MediaRecorder polyfills',
  component: MediaRecorderPolyfillFrontComponent,
});
