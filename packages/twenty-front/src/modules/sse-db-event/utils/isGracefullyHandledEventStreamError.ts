export const isGracefullyHandledEventStreamError = ({
  subCode,
  code,
}: {
  subCode?: string;
  code?: string;
}) =>
  subCode === 'EVENT_STREAM_DOES_NOT_EXIST' ||
  subCode === 'EVENT_STREAM_ALREADY_EXISTS' ||
  subCode === 'NOT_AUTHORIZED' ||
  code === 'UNAUTHENTICATED' ||
  code === 'FORBIDDEN';
