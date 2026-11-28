import { afterEach, describe, expect, it, vi } from 'vitest';

import { TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES } from 'src/logic-functions/constants/telegram-assistant-max-attachment-size-bytes';
import { downloadTelegramFileOrThrow } from 'src/logic-functions/utils/download-telegram-file-or-throw';

const BOT_TOKEN = '123:secret-token';
const FILE_URL = `https://api.telegram.org/file/bot${BOT_TOKEN}/documents/file_1.pdf`;

const stubFetch = ({
  file = { file_path: 'documents/file_1.pdf' },
  download = async () => ({
    ok: true,
    status: 200,
    arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
  }),
}: {
  file?: { file_path?: string; file_size?: number };
  download?: () => Promise<object>;
} = {}) => {
  const fetchMock = vi.fn(async (url: string) =>
    url.endsWith('/getFile')
      ? { status: 200, json: async () => ({ ok: true, result: file }) }
      : download(),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
};

const download = () =>
  downloadTelegramFileOrThrow({ botToken: BOT_TOKEN, telegramFileId: 'doc-1' });

describe('downloadTelegramFileOrThrow', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the bytes of the path Telegram gives for the file', async () => {
    const fetchMock = stubFetch();

    await expect(download()).resolves.toEqual(new Uint8Array([1, 2, 3]));
    expect(fetchMock).toHaveBeenLastCalledWith(FILE_URL, expect.anything());
  });

  it('throws when Telegram gives no path for the file', async () => {
    stubFetch({ file: {} });

    await expect(download()).rejects.toThrow(
      'Telegram did not return a path for the file',
    );
  });

  it('does not download a file Telegram reports over the size limit', async () => {
    const fetchMock = stubFetch({
      file: {
        file_path: 'documents/file_1.pdf',
        file_size: TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES + 1,
      },
    });

    await expect(download()).rejects.toThrow('the file is over the size limit');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('throws when the downloaded file is over the size limit', async () => {
    stubFetch({
      download: async () => ({
        ok: true,
        status: 200,
        arrayBuffer: async () =>
          new ArrayBuffer(TELEGRAM_ASSISTANT_MAX_ATTACHMENT_SIZE_BYTES + 1),
      }),
    });

    await expect(download()).rejects.toThrow('the file is over the size limit');
  });

  it('throws with the status when the download fails', async () => {
    stubFetch({ download: async () => ({ ok: false, status: 404 }) });

    await expect(download()).rejects.toThrow(
      'the file download failed with status 404',
    );
  });

  it('keeps the bot token out of the error when the download cannot connect', async () => {
    stubFetch({
      download: async () => {
        throw new Error(`request to ${FILE_URL} failed`);
      },
    });

    const error = await download().catch((caught: unknown) => caught);

    expect(error).toEqual(
      new Error('the file download did not reach Telegram'),
    );
    expect(String(error)).not.toContain(BOT_TOKEN);
  });
});
