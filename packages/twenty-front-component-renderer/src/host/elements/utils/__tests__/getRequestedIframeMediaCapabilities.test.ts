import { getRequestedIframeMediaCapabilities } from '../getRequestedIframeMediaCapabilities';

describe('getRequestedIframeMediaCapabilities', () => {
  it('recognizes media feature directives independently of other features', () => {
    expect(
      getRequestedIframeMediaCapabilities(
        "autoplay; microphone 'src'; camera https://camera.example.com; fullscreen",
      ),
    ).toEqual(['microphone', 'camera']);
  });

  it('normalizes casing and whitespace before finding a media request', () => {
    expect(
      getRequestedIframeMediaCapabilities(' ; MICROPHONE\t* ; Camera ; '),
    ).toEqual(['microphone', 'camera']);
  });

  it('uses the first directive for each feature', () => {
    expect(
      getRequestedIframeMediaCapabilities(
        "microphone 'none'; microphone *; camera; camera 'none'",
      ),
    ).toEqual(['camera']);
  });

  it('does not treat disabled capabilities as requests', () => {
    expect(
      getRequestedIframeMediaCapabilities("microphone 'none'; camera 'none'"),
    ).toEqual([]);
  });

  it.each([undefined, '', 'microphone-extra *; speaker-selection'])(
    'finds no media request in the allow value %p',
    (allow) => {
      expect(getRequestedIframeMediaCapabilities(allow)).toEqual([]);
    },
  );
});
