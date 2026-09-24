import { describe, expect, it } from 'vitest';

import { isSlackAttachmentCandidate } from 'src/logic-functions/utils/is-slack-attachment-candidate';

const PNG_FILE = {
  id: 'F1',
  name: 'screenshot.png',
  mimetype: 'image/png',
  url_private: 'https://files.slack.com/screenshot.png',
  size: 1024,
};

describe('isSlackAttachmentCandidate', () => {
  it('should accept an image the agent can read', () => {
    expect(isSlackAttachmentCandidate(PNG_FILE)).toBe(true);
  });

  it.each(['image/heic', 'image/heif'])(
    'should accept %s, which an iPhone shares natively',
    (mimetype) => {
      expect(isSlackAttachmentCandidate({ ...PNG_FILE, mimetype })).toBe(true);
    },
  );

  it('should reject a file type no model reads natively', () => {
    expect(
      isSlackAttachmentCandidate({
        ...PNG_FILE,
        name: 'numbers.xlsx',
        mimetype:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    ).toBe(false);
  });

  it('should reject a file over the size limit', () => {
    expect(
      isSlackAttachmentCandidate({ ...PNG_FILE, size: 11 * 1024 * 1024 }),
    ).toBe(false);
  });

  it('should accept a file whose size Slack did not report', () => {
    expect(isSlackAttachmentCandidate({ ...PNG_FILE, size: undefined })).toBe(
      true,
    );
  });

  it('should reject a stub that carries no private url', () => {
    expect(
      isSlackAttachmentCandidate({
        id: 'F2',
        mimetype: 'image/png',
        file_access: 'check_file_info',
      }),
    ).toBe(false);
  });
});
