import { useState } from 'react';

import { isDefined } from 'twenty-shared/utils';

export const useTimelineProjectionRuleForm = ({
  initialSourceObjectMetadataId,
  initialLinkedObjectMetadataIds,
}: {
  initialSourceObjectMetadataId?: string;
  initialLinkedObjectMetadataIds: string[];
}) => {
  const [sourceObjectMetadataId, setSourceObjectMetadataId] = useState<
    string | undefined
  >(initialSourceObjectMetadataId);
  const [linkedObjectMetadataIds, setLinkedObjectMetadataIds] = useState<
    string[]
  >(initialLinkedObjectMetadataIds);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleActivityType = (id: string, checked: boolean) => {
    setLinkedObjectMetadataIds((previous) =>
      checked
        ? [...new Set([...previous, id])]
        : previous.filter((linkedId) => linkedId !== id),
    );
  };

  const canSave =
    isDefined(sourceObjectMetadataId) &&
    linkedObjectMetadataIds.length > 0 &&
    !isSubmitting;

  return {
    sourceObjectMetadataId,
    setSourceObjectMetadataId,
    linkedObjectMetadataIds,
    toggleActivityType,
    isSubmitting,
    setIsSubmitting,
    canSave,
  };
};
