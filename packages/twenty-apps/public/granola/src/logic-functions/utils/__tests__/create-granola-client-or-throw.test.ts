import { afterEach, describe, expect, it, vi } from 'vitest';
import { RetryableLogicFunctionError } from 'twenty-sdk/logic-function';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { GranolaApiError } from 'src/logic-functions/types/granola-api-error';
import { GranolaInvalidResponseError } from 'src/logic-functions/types/granola-invalid-response-error';
import { createGranolaClientOrThrow } from 'src/logic-functions/utils/create-granola-client-or-throw.util';

const API_KEY = 'grn_test_secret';

afterEach(() => vi.unstubAllGlobals());

describe('createGranolaClientOrThrow', () => {
  it('sends authenticated list filters and opaque cursors without mangling them', async () => {
    const mockedFetch = vi
      .fn<typeof fetch>()
      .mockResolvedValue(
        Response.json({ notes: [], hasMore: false, cursor: null }),
      );
    vi.stubGlobal('fetch', mockedFetch);

    await createGranolaClientOrThrow({ apiKey: API_KEY }).listNotes({
      folder_id: 'fol_example',
      updated_after: '2026-09-05T10:00:00+05:30',
      cursor: 'a+/=',
      page_size: 30,
    });

    const [url, request] = mockedFetch.mock.calls[0];
    expect(url).toBeInstanceOf(URL);
    expect(String(url)).toContain('cursor=a%2B%2F%3D');
    expect(String(url)).toContain(
      'updated_after=2026-09-05T10%3A00%3A00%2B05%3A30',
    );
    expect(request?.headers).toMatchObject({
      Authorization: `Bearer ${API_KEY}`,
    });
  });

  it('discards private notes at the API boundary', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockResolvedValue(
        Response.json({
          ...buildGranolaNote(),
          private_notes_text: 'Private scratchpad',
          private_notes_markdown: '# Private',
        }),
      ),
    );

    const note = await createGranolaClientOrThrow({ apiKey: API_KEY }).getNote({
      noteId: 'not_1d3tmYTlCICgjy',
    });

    expect(note).not.toHaveProperty('private_notes_text');
    expect(note).not.toHaveProperty('private_notes_markdown');
    expect(note.summary_text).toBe('Shared summary');
  });

  it.each([400, 401, 403, 404, 413])(
    'preserves nonretryable HTTP %s without disclosing the body',
    async (status) => {
      vi.stubGlobal(
        'fetch',
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(new Response(API_KEY, { status })),
      );
      const promise = createGranolaClientOrThrow({
        apiKey: API_KEY,
      }).listFolders();

      await expect(promise).rejects.toBeInstanceOf(GranolaApiError);
      await expect(promise).rejects.toMatchObject({ status });
      await expect(promise).rejects.not.toThrow(API_KEY);
    },
  );

  it.each([429, 500, 502, 503])('makes HTTP %s retryable', async (status) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response(API_KEY, { status })),
    );
    await expect(
      createGranolaClientOrThrow({ apiKey: API_KEY }).listFolders(),
    ).rejects.toBeInstanceOf(RetryableLogicFunctionError);
  });

  it('makes network failure retryable without leaking the underlying error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn<typeof fetch>().mockRejectedValue(new Error(API_KEY)),
    );
    const promise = createGranolaClientOrThrow({
      apiKey: API_KEY,
    }).listFolders();
    await expect(promise).rejects.toBeInstanceOf(RetryableLogicFunctionError);
    await expect(promise).rejects.not.toThrow(API_KEY);
  });

  it('rejects malformed API data without exposing it', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json({ folders: API_KEY })),
    );
    const promise = createGranolaClientOrThrow({
      apiKey: API_KEY,
    }).listFolders();
    await expect(promise).rejects.toBeInstanceOf(GranolaInvalidResponseError);
    await expect(promise).rejects.not.toThrow(API_KEY);
  });

  it('rejects blank keys before making a request', () => {
    const mockedFetch = vi.fn<typeof fetch>();
    vi.stubGlobal('fetch', mockedFetch);
    expect(() => createGranolaClientOrThrow({ apiKey: '  ' })).toThrow(
      'not set',
    );
    expect(mockedFetch).not.toHaveBeenCalled();
  });
});
