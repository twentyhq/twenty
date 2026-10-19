import { type LinkRecord } from '@/object-record/record-field/ui/meta-types/input/types/LinkRecord';
import { getLinkLabelFromDraft } from '@/object-record/record-field/ui/meta-types/input/utils/getLinkLabelFromDraft';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type EditedLink = {
  index: number;
  url: string;
  isLabelInputShown: boolean;
};

export const useLinksLabelEditing = ({ links }: { links: LinkRecord[] }) => {
  const [editedLink, setEditedLink] = useState<EditedLink | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  const startEditing = (index: number, isLabelInputShown: boolean) => {
    setEditedLink({ index, url: links[index]?.url ?? '', isLabelInputShown });
    setLabelDraft(links[index]?.label ?? '');
  };

  const startUrlEditing = (index: number) => startEditing(index, false);

  const startLabelEditing = (index: number) => startEditing(index, true);

  const stopEditing = () => {
    setEditedLink(null);
  };

  const getLinkLabel = (index?: number) => {
    if (!isDefined(index)) {
      return null;
    }

    return index === editedLink?.index
      ? getLinkLabelFromDraft(labelDraft)
      : (links[index]?.label ?? null);
  };

  return {
    editedLink,
    labelDraft,
    setLabelDraft,
    startUrlEditing,
    startLabelEditing,
    stopEditing,
    getLinkLabel,
  };
};
