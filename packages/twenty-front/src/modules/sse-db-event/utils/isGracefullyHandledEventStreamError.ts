import { isNonEmptyString } from '@sniptt/guards';

export const isGracefullyHandledEventStreamError = ({
  subCode,
  code,
}: {
  subCode?: unknown;
  code?: unknown;
}) => {
  if (!isNonEmptyString(subCode) && !isNonEmptyString(code)) {
    return false;
  }

  return (
    subCode === 'EVENT_STREAM_DOES_NOT_EXIST' ||
    subCode === 'EVENT_STREAM_ALREADY_EXISTS' ||
    subCode === 'NOT_AUTHORIZED' ||
    code === 'UNAUTHENTICATED' ||
    code === 'FORBIDDEN'
  );
};
