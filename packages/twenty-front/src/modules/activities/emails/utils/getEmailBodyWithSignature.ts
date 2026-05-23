import { isDefined } from 'twenty-shared/utils';

const EMAIL_SIGNATURE_SEPARATOR = '<p></p>';

export const getEmailBodyWithSignature = (
  emailSignature: string | null | undefined,
) => {
  const trimmedEmailSignature = emailSignature?.trim();

  if (!isDefined(trimmedEmailSignature) || trimmedEmailSignature.length === 0) {
    return '';
  }

  return `${EMAIL_SIGNATURE_SEPARATOR}${trimmedEmailSignature}`;
};

const getEmailBodyWithoutTrailingSignature = (
  body: string,
  emailSignature: string | null | undefined,
) => {
  const trimmedEmailSignature = emailSignature?.trim();

  if (!isDefined(trimmedEmailSignature) || trimmedEmailSignature.length === 0) {
    return body;
  }

  const trimmedBody = body.trimEnd();

  if (!trimmedBody.endsWith(trimmedEmailSignature)) {
    return body;
  }

  const bodyWithoutSignature = trimmedBody.slice(
    0,
    -trimmedEmailSignature.length,
  );

  if (bodyWithoutSignature.endsWith(EMAIL_SIGNATURE_SEPARATOR)) {
    return bodyWithoutSignature.slice(0, -EMAIL_SIGNATURE_SEPARATOR.length);
  }

  return bodyWithoutSignature;
};

export const getEmailBodyWithUpdatedSignature = ({
  body,
  previousEmailSignature,
  nextEmailSignature,
}: {
  body: string;
  previousEmailSignature: string | null | undefined;
  nextEmailSignature: string | null | undefined;
}) => {
  const bodyWithoutPreviousSignature = getEmailBodyWithoutTrailingSignature(
    body,
    previousEmailSignature,
  );
  const nextEmailBodySignature = getEmailBodyWithSignature(nextEmailSignature);

  if (nextEmailBodySignature.length === 0) {
    return bodyWithoutPreviousSignature;
  }

  if (bodyWithoutPreviousSignature.trim().length === 0) {
    return nextEmailBodySignature;
  }

  return `${bodyWithoutPreviousSignature}${nextEmailBodySignature}`;
};
