import { isDefined } from 'twenty-shared/utils';

export const getEmailBodyWithSignature = (
  emailSignature: string | null | undefined,
) => {
  if (!isDefined(emailSignature) || emailSignature.trim().length === 0) {
    return '';
  }

  return `<p></p>${emailSignature}`;
};

const getEmailBodyWithoutTrailingSignature = (
  body: string,
  emailSignature: string | null | undefined,
) => {
  if (!isDefined(emailSignature) || emailSignature.trim().length === 0) {
    return body;
  }

  const trimmedBody = body.trimEnd();

  if (!trimmedBody.endsWith(emailSignature)) {
    return body;
  }

  return trimmedBody.slice(0, -emailSignature.length);
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

  if (
    !isDefined(nextEmailSignature) ||
    nextEmailSignature.trim().length === 0
  ) {
    return bodyWithoutPreviousSignature;
  }

  if (bodyWithoutPreviousSignature.trim().length === 0) {
    return getEmailBodyWithSignature(nextEmailSignature);
  }

  return `${bodyWithoutPreviousSignature}<p></p>${nextEmailSignature}`;
};
