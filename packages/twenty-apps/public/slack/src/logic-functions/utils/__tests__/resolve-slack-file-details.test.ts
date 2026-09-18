import { type WebClient } from '@slack/web-api';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveSlackFileDetails } from 'src/logic-functions/utils/resolve-slack-file-details';

const filesInfo = vi.fn();

const slackClient = {
  files: { info: filesInfo },
} as unknown as WebClient;

const STUB_FILE = {
  id: 'F1',
  file_access: 'check_file_info',
};

describe('resolveSlackFileDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should leave a file Slack already described untouched', async () => {
    const file = {
      id: 'F1',
      name: 'screenshot.png',
      mimetype: 'image/png',
      url_private: 'https://files.slack.com/screenshot.png',
    };

    expect(
      await resolveSlackFileDetails({ client: slackClient, file }),
    ).toEqual({ file, isFilesReadScopeMissing: false });
    expect(filesInfo).not.toHaveBeenCalled();
  });

  it('should fill a stub with the details files.info returns', async () => {
    filesInfo.mockResolvedValue({
      ok: true,
      file: {
        id: 'F1',
        name: 'screenshot.png',
        title: 'Screenshot',
        mimetype: 'image/png',
        size: 1024,
        url_private: 'https://files.slack.com/screenshot.png',
        created: 1700000000,
      },
    });

    expect(
      await resolveSlackFileDetails({ client: slackClient, file: STUB_FILE }),
    ).toEqual({
      file: {
        id: 'F1',
        name: 'screenshot.png',
        title: 'Screenshot',
        mimetype: 'image/png',
        size: 1024,
        url_private: 'https://files.slack.com/screenshot.png',
        file_access: undefined,
      },
      isFilesReadScopeMissing: false,
    });
  });

  it('should leave the stub as it is when files.info answers without a file', async () => {
    filesInfo.mockResolvedValue({ ok: true });

    expect(
      await resolveSlackFileDetails({ client: slackClient, file: STUB_FILE }),
    ).toEqual({ file: STUB_FILE, isFilesReadScopeMissing: false });
  });

  it('should leave the stub as it is when files.info fails', async () => {
    filesInfo.mockRejectedValue(new Error('boom'));

    expect(
      await resolveSlackFileDetails({ client: slackClient, file: STUB_FILE }),
    ).toEqual({ file: STUB_FILE, isFilesReadScopeMissing: false });
  });

  it('should name the missing scope when Slack refuses to describe the stub', async () => {
    filesInfo.mockRejectedValue(
      Object.assign(new Error('An API error occurred: missing_scope'), {
        data: { ok: false, error: 'missing_scope' },
      }),
    );

    expect(
      await resolveSlackFileDetails({ client: slackClient, file: STUB_FILE }),
    ).toEqual({ file: STUB_FILE, isFilesReadScopeMissing: true });
  });
});
