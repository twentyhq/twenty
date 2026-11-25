import { describe, expect, it } from 'vitest';

import { parseLinkedinConnectSubmission } from 'src/logic-functions/utils/parse-linkedin-connect-submission.util';

describe('parseLinkedinConnectSubmission', () => {
  it('keeps the text fields of the form', () => {
    expect(
      parseLinkedinConnectSubmission({
        flow: 'signed.flow',
        action: 'solve',
        code: '123456',
        unknown: 'field',
      }),
    ).toEqual({
      flow: 'signed.flow',
      action: 'solve',
      username: undefined,
      password: undefined,
      code: '123456',
    });
  });

  it.each([
    null,
    { username: { safeHtml: '<script>' }, password: ['secret'], code: 123456 },
  ])('drops everything that is not text from %j', (body) => {
    expect(parseLinkedinConnectSubmission(body)).toEqual({
      flow: undefined,
      action: undefined,
      username: undefined,
      password: undefined,
      code: undefined,
    });
  });
});
