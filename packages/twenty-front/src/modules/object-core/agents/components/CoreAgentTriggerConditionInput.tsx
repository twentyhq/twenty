import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { RecordEventConditionEditor } from '@/validation-rules/components/RecordEventConditionEditor';

type CoreAgentTriggerConditionInputProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  condition: string;
  onConditionChange: (condition: string) => void;
  isReadOnly: boolean;
};

export const CoreAgentTriggerConditionInput = ({
  objectMetadataItem,
  condition,
  onConditionChange,
  isReadOnly,
}: CoreAgentTriggerConditionInputProps) => {
  const { t } = useLingui();

  if (isReadOnly && !isNonEmptyString(condition)) {
    return null;
  }

  return (
    <div>
      <InputLabel>{t`Condition (Optional)`}</InputLabel>
      <RecordEventConditionEditor
        objectMetadataItem={objectMetadataItem}
        condition={condition}
        onConditionChange={onConditionChange}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
