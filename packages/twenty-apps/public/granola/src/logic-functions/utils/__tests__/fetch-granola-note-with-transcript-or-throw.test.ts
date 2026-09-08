import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { buildGranolaTranscriptItem } from 'src/__tests__/utils/build-granola-transcript-item.util';
import { GranolaTranscriptLimitError } from 'src/logic-functions/types/granola-transcript-limit-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';
import { fetchGranolaNoteWithTranscriptOrThrow } from 'src/logic-functions/utils/fetch-granola-note-with-transcript-or-throw.util';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('fetchGranolaNoteWithTranscriptOrThrow', () => {
  it('stops a slow transcript before the worker exhausts its execution budget', async () => {
    vi.useFakeTimers();
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 413 }))
      .mockResolvedValueOnce(Response.json(buildGranolaNote()))
      .mockImplementation(async () => {
        vi.setSystemTime(Date.now() + 800_000);
        return Response.json({ transcript: [], hasMore: true, cursor: 'next' });
      });
    vi.stubGlobal('fetch', mockedFetch);

    const pendingNote = fetchGranolaNoteWithTranscriptOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      noteId: 'not_1d3tmYTlCICgjy',
    });
    const rejection = expect(pendingNote).rejects.toBeInstanceOf(
      GranolaTranscriptLimitError,
    );
    await vi.advanceTimersByTimeAsync(250);
    await rejection;
    expect(mockedFetch).toHaveBeenCalledTimes(3);
  });

  it('retrieves a large transcript whose pacing exceeds one minute', async () => {
    vi.useFakeTimers();
    const transcriptItem = buildGranolaTranscriptItem();
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 413 }))
      .mockResolvedValueOnce(Response.json(buildGranolaNote()))
      .mockImplementation(async (url) => {
        const pageIndex = Number(
          new URL(String(url)).searchParams.get('cursor') ?? 0,
        );
        return Response.json({
          transcript: [transcriptItem],
          hasMore: pageIndex < 241,
          cursor: pageIndex < 241 ? String(pageIndex + 1) : null,
        });
      });
    vi.stubGlobal('fetch', mockedFetch);

    const pendingNote = fetchGranolaNoteWithTranscriptOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      noteId: 'not_1d3tmYTlCICgjy',
    });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mockedFetch).toHaveBeenCalledTimes(243);
    await vi.advanceTimersByTimeAsync(250);
    const note = await pendingNote;
    expect(note.transcript).toHaveLength(242);
  });

  it('paces transcript pages below the sustained provider request limit', async () => {
    vi.useFakeTimers();
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 413 }))
      .mockResolvedValueOnce(Response.json(buildGranolaNote()))
      .mockResolvedValueOnce(
        Response.json({ transcript: [], hasMore: true, cursor: 'next' }),
      )
      .mockResolvedValueOnce(
        Response.json({ transcript: [], hasMore: false, cursor: null }),
      );
    vi.stubGlobal('fetch', mockedFetch);

    const pendingNote = fetchGranolaNoteWithTranscriptOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      noteId: 'not_1d3tmYTlCICgjy',
    });
    await vi.advanceTimersByTimeAsync(249);
    expect(mockedFetch).toHaveBeenCalledTimes(3);
    await vi.advanceTimersByTimeAsync(1);
    await pendingNote;
    expect(mockedFetch).toHaveBeenCalledTimes(4);
  });

  it('recovers a 413 through paginated transcript retrieval', async () => {
    const firstItem = buildGranolaTranscriptItem();
    const lastItem = buildGranolaTranscriptItem({ text: 'Goodbye' });
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 413 }))
      .mockResolvedValueOnce(Response.json(buildGranolaNote()))
      .mockResolvedValueOnce(
        Response.json({
          transcript: [firstItem],
          hasMore: true,
          cursor: 'next/page+',
        }),
      )
      .mockResolvedValueOnce(
        Response.json({ transcript: [lastItem], hasMore: false, cursor: null }),
      );
    vi.stubGlobal('fetch', mockedFetch);

    const result = await fetchGranolaNoteWithTranscriptOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      noteId: 'not_1d3tmYTlCICgjy',
    });

    expect(result.transcript).toEqual([firstItem, lastItem]);
    expect(String(mockedFetch.mock.calls[0][0])).toContain(
      'include=transcript',
    );
    expect(String(mockedFetch.mock.calls[1][0])).not.toContain('include=');
    expect(String(mockedFetch.mock.calls[3][0])).toContain(
      'cursor=next%2Fpage%2B',
    );
  });

  it.each(['loop', null])(
    'rejects a non-advancing cursor (%s) with a typed error',
    async (cursor) => {
      const mockedFetch = vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(new Response(null, { status: 413 }))
        .mockResolvedValueOnce(Response.json(buildGranolaNote()))
        .mockImplementation(async () =>
          Response.json({ transcript: [], hasMore: true, cursor }),
        );
      vi.stubGlobal('fetch', mockedFetch);

      const pendingNote = fetchGranolaNoteWithTranscriptOrThrow({
        client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
        noteId: 'not_1d3tmYTlCICgjy',
      });

      await expect(pendingNote).rejects.toBeInstanceOf(
        GranolaTranscriptLimitError,
      );
      await expect(pendingNote).rejects.toThrow(
        `did not advance for note not_1d3tmYTlCICgjy at cursor ${cursor ?? 'none'}`,
      );
      expect(mockedFetch).toHaveBeenCalledTimes(cursor === null ? 3 : 4);
    },
  );

  it('stops at the page limit when the transcript never reports completion', async () => {
    vi.useFakeTimers();
    let pageIndex = 0;
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response(null, { status: 413 }))
      .mockResolvedValueOnce(Response.json(buildGranolaNote()))
      .mockImplementation(async () => {
        pageIndex += 1;
        return Response.json({
          transcript: [],
          hasMore: true,
          cursor: String(pageIndex),
        });
      });
    vi.stubGlobal('fetch', mockedFetch);

    const pendingNote = fetchGranolaNoteWithTranscriptOrThrow({
      client: createGranolaClientOrThrow({ apiKey: 'grn_test' }),
      noteId: 'not_1d3tmYTlCICgjy',
    });
    const rejection = expect(pendingNote).rejects.toThrow('1,000-page');
    await vi.advanceTimersByTimeAsync(1_000 * 250);
    await rejection;
    expect(mockedFetch).toHaveBeenCalledTimes(1_002);
  });
});
