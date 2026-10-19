import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useLinksLabelEditing = ({
  links,
  onLabelSubmit,
}: {
  links: LinkRecord[];
  onLabelSubmit: (updatedLinks: LinkRecord[]) => void;
}) => {
  const [labelEditingIndex, setLabelEditingIndex] = useState<number | null>(
    null,
  );
  const [labelDraft, setLabelDraft] = useState('');

  const applyLabelDraft = (currentLinks: LinkRecord[], draft = labelDraft) =>
    currentLinks.map((link, index) =>
      index === labelEditingIndex
        ? {
            ...link,
            label: isNonEmptyString(draft.trim()) ? draft.trim() : null,
          }
        : link,
    );

  const startLabelEditing = (index: number) => {
    setLabelDraft(links[index]?.label ?? '');
    setLabelEditingIndex(index);
  };

  const stopLabelEditing = () => {
    setLabelEditingIndex(null);
  };

  const submitLabel = () => {
    const updatedLinks = applyLabelDraft(links);

    stopLabelEditing();

    if (!isDeeplyEqual(links, updatedLinks)) {
      onLabelSubmit(updatedLinks);
    }
  };

  return {
    labelEditingIndex,
    labelDraft,
    setLabelDraft,
    applyLabelDraft,
    startLabelEditing,
    stopLabelEditing,
    submitLabel,
  };
};
