export type IsFieldReadOnlyBySystemParams = {
  isUIReadOnly?: boolean;
};

export const isFieldReadOnlyBySystem = ({
  isUIReadOnly,
}: IsFieldReadOnlyBySystemParams) => {
  if (isUIReadOnly === true) {
    return true;
  }
  return false;
};
