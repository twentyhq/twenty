type IsMutationOldValueRequestedInput = {
  options: MutationObserverInit;
  recordType: MutationRecordType;
};

export const isMutationOldValueRequested = ({
  options,
  recordType,
}: IsMutationOldValueRequestedInput): boolean => {
  if (recordType === 'attributes') {
    return options.attributeOldValue === true;
  }

  if (recordType === 'characterData') {
    return options.characterDataOldValue === true;
  }

  return false;
};
