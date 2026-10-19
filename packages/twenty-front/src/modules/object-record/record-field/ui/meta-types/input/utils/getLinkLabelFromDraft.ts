import { isNonEmptyString } from '@sniptt/guards';

export const getLinkLabelFromDraft = (labelDraft: string) => {
  const trimmedLabelDraft = labelDraft.trim();

  return isNonEmptyString(trimmedLabelDraft) ? trimmedLabelDraft : null;
};
