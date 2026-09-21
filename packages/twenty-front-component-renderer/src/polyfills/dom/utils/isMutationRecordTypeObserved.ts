import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type IsMutationRecordTypeObservedInput = {
  options: MutationObserverInit;
  recordType: MutationRecordType;
  attributeName: string | null;
};

export const isMutationRecordTypeObserved = ({
  options,
  recordType,
  attributeName,
}: IsMutationRecordTypeObservedInput): boolean => {
  if (recordType === 'childList') {
    return options.childList === true;
  }

  if (recordType === 'characterData') {
    return options.characterData === true;
  }

  if (options.attributes !== true) {
    return false;
  }

  const { attributeFilter } = options;

  if (!isDefined(attributeFilter)) {
    return true;
  }

  return (
    isNonEmptyString(attributeName) && attributeFilter.includes(attributeName)
  );
};
