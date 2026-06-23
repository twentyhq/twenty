import { useState } from 'react';

import { isDefined } from 'twenty-shared/utils';

export const useTimelineProjectionRuleForm = (
  defaultLinkedObjectMetadataIds: string[],
) => {
  const [anchorObjectMetadataId, setAnchorObjectMetadataId] = useState<
    string | undefined
  >(undefined);
  const [sourceObjectMetadataId, setSourceObjectMetadataId] = useState<
    string | undefined
  >(undefined);
  const [linkedObjectMetadataIds, setLinkedObjectMetadataIds] = useState<
    string[]
  >(defaultLinkedObjectMetadataIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleActivityType = (id: string, checked: boolean) => {
    setLinkedObjectMetadataIds((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((linkedId) => linkedId !== id),
    );
  };

  const canSave =
    isDefined(anchorObjectMetadataId) &&
    isDefined(sourceObjectMetadataId) &&
    linkedObjectMetadataIds.length > 0 &&
    !isSubmitting;

  return {
    anchorObjectMetadataId,
    setAnchorObjectMetadataId,
    sourceObjectMetadataId,
    setSourceObjectMetadataId,
    linkedObjectMetadataIds,
    toggleActivityType,
    isSubmitting,
    setIsSubmitting,
    canSave,
  };
};
