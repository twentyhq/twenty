const SAMPLE_RATE = 8000;
const SAMPLE_COUNT = SAMPLE_RATE * 59;
const headerBytes = new Uint8Array(44);
const header = new DataView(headerBytes.buffer);

headerBytes.set(new TextEncoder().encode('RIFF'), 0);
header.setUint32(4, 36 + SAMPLE_COUNT, true);
headerBytes.set(new TextEncoder().encode('WAVEfmt '), 8);
header.setUint32(16, 16, true);
header.setUint16(20, 1, true);
header.setUint16(22, 1, true);
header.setUint32(24, SAMPLE_RATE, true);
header.setUint32(28, SAMPLE_RATE, true);
header.setUint16(32, 1, true);
header.setUint16(34, 8, true);
headerBytes.set(new TextEncoder().encode('data'), 36);
header.setUint32(40, SAMPLE_COUNT, true);

// A generated silent WAV keeps the fixture small in source and seekable in
// Chromium, unlike media served through the msw service worker passthrough.
export const MOCK_CALL_RECORDING_AUDIO_DATA_URI = `data:audio/wav;base64,${btoa(
  String.fromCharCode(...headerBytes) +
    String.fromCharCode(128).repeat(SAMPLE_COUNT),
)}`;
