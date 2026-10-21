import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useLinksLabelEditing = ({ links }: { links: LinkRecord[] }) => {
  const [editedLinkIndex, setEditedLinkIndex] = useState<number | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  const startEditing = (index: number) => {
    setEditedLinkIndex(index);
    setLabelDraft(links[index]?.label ?? '');
  };

  const stopEditing = () => {
    setEditedLinkIndex(null);
  };

  const getLinkLabel = (index?: number) => {
    if (!isDefined(index)) {
      return null;
    }

    return index === editedLinkIndex
      ? getLinkLabelFromDraft(labelDraft)
      : (links[index]?.label ?? null);
  };

  return {
    labelDraft,
    setLabelDraft,
    startEditing,
    stopEditing,
    getLinkLabel,
  };
};
