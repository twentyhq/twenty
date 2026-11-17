import { act, renderHook } from '@testing-library/react';

import { useStableMediaUrl } from '@/chat/hooks/useStableMediaUrl';

const FIRST_URL = 'https://files.test/video.mp4?token=first';
const RESIGNED_URL = 'https://files.test/video.mp4?token=resigned';

describe('useStableMediaUrl', () => {
  it('keeps the first url when the file is re-signed', () => {
    const { result, rerender } = renderHook(
      ({ url }) => useStableMediaUrl(url),
      { initialProps: { url: FIRST_URL } },
    );

    rerender({ url: RESIGNED_URL });

    expect(result.current.mediaUrl).toBe(FIRST_URL);
    expect(result.current.hasMediaFailedToLoad).toBe(false);
  });

  it('retries with the re-signed url before reporting a failure', () => {
    const { result, rerender } = renderHook(
      ({ url }) => useStableMediaUrl(url),
      { initialProps: { url: FIRST_URL } },
    );

    rerender({ url: RESIGNED_URL });
    act(() => result.current.handleMediaError());

    expect(result.current.mediaUrl).toBe(RESIGNED_URL);
    expect(result.current.hasMediaFailedToLoad).toBe(false);

    act(() => result.current.handleMediaError());

    expect(result.current.hasMediaFailedToLoad).toBe(true);
  });

  it('uses a url that only arrives after mount', () => {
    const initialProps: { url: string | undefined } = { url: undefined };
    const { result, rerender } = renderHook(
      ({ url }) => useStableMediaUrl(url),
      { initialProps },
    );

    rerender({ url: FIRST_URL });

    expect(result.current.mediaUrl).toBe(FIRST_URL);
  });
});
