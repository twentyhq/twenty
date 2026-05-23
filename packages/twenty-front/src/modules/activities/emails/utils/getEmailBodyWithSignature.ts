import { isDefined } from 'twenty-shared/utils';

export const getEmailBodyWithSignature = (
  emailSignature: string | null | undefined,
) => {
  if (!isDefined(emailSignature) || emailSignature.trim().length === 0) {
    return '';
  }

  return `<p></p>${emailSignature}`;
};
