import { type SerializedEventData } from '@/types/SerializedEventData';

export const applySerializedEventTargetProperties = (
  element: Record<string, unknown>,
  eventData: SerializedEventData,
): void => {
  if ('value' in eventData) {
    element.value = eventData.value;
  }

  if ('checked' in eventData) {
    element.checked = eventData.checked;
  }

  if ('files' in eventData) {
    element.files = eventData.files;
  }

  if ('scrollTop' in eventData) {
    element.scrollTop = eventData.scrollTop;
  }

  if ('scrollLeft' in eventData) {
    element.scrollLeft = eventData.scrollLeft;
  }

  if ('currentTime' in eventData) {
    element.currentTime = eventData.currentTime;
  }

  if ('duration' in eventData) {
    element.duration = eventData.duration;
  }

  if ('paused' in eventData) {
    element.paused = eventData.paused;
  }

  if ('ended' in eventData) {
    element.ended = eventData.ended;
  }

  if ('volume' in eventData) {
    element.volume = eventData.volume;
  }

  if ('muted' in eventData) {
    element.muted = eventData.muted;
  }

  if ('playbackRate' in eventData) {
    element.playbackRate = eventData.playbackRate;
  }
};
