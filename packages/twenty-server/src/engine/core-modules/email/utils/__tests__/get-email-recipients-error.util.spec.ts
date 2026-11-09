import { MAX_EMAIL_RECIPIENTS } from 'twenty-shared/constants';

import { getEmailRecipientsError } from 'src/engine/core-modules/email/utils/get-email-recipients-error.util';

describe('getEmailRecipientsError', () => {
  it('should accept valid recipients', () => {
    expect(
      getEmailRecipientsError({
        to: ['ada@example.com'],
        cc: ['grace@example.com'],
        bcc: [],
      }),
    ).toBeNull();
  });

  it('should list the invalid addresses', () => {
    const error = getEmailRecipientsError({
      to: ['ada@example.com', 'not-an-email'],
      cc: [],
      bcc: ['also bad'],
    });

    expect(error?.values).toEqual({
      invalidEmailList: 'not-an-email, also bad',
    });
  });

  it('should refuse more recipients than the limit across to, cc and bcc', () => {
    const error = getEmailRecipientsError({
      to: Array.from(
        { length: MAX_EMAIL_RECIPIENTS },
        (_, index) => `to${index}@example.com`,
      ),
      cc: [],
      bcc: ['one-too-many@example.com'],
    });

    expect(error?.values).toEqual({
      total: MAX_EMAIL_RECIPIENTS + 1,
      MAX_EMAIL_RECIPIENTS,
    });
  });
});
