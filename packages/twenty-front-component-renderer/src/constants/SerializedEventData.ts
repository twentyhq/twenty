export type SerializedFileData = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  // Opaque handle to the real File held on the host. The worker passes it to the
  // `readFrontComponentFile` host RPC to pull the bytes on demand. Absent when the
  // host can't register the file (e.g. an older host); callers treat that as
  // "bytes unavailable".
  token?: string;
};

export type SerializedEventData = {
  type: string;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  clientX?: number;
  clientY?: number;
  pageX?: number;
  pageY?: number;
  screenX?: number;
  screenY?: number;
  offsetX?: number;
  offsetY?: number;
  movementX?: number;
  movementY?: number;
  button?: number;
  buttons?: number;
  pointerId?: number;
  pointerType?: string;
  pressure?: number;
  tangentialPressure?: number;
  tiltX?: number;
  tiltY?: number;
  twist?: number;
  width?: number;
  height?: number;
  isPrimary?: boolean;
  key?: string;
  code?: string;
  repeat?: boolean;
  value?: string;
  checked?: boolean;
  scrollTop?: number;
  scrollLeft?: number;
  deltaX?: number;
  deltaY?: number;
  deltaZ?: number;
  deltaMode?: number;
  currentTime?: number;
  duration?: number;
  paused?: boolean;
  ended?: boolean;
  volume?: number;
  muted?: boolean;
  playbackRate?: number;
  files?: SerializedFileData[];
};

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
