import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ValidationRuleBindings } from 'twenty-shared/types';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { RecordEventConditionEditor } from '@/validation-rules/components/RecordEventConditionEditor';

type CoreAgentTriggerConditionInputProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  condition: string;
  conditionBindings?: ValidationRuleBindings;
  onConditionChange: (condition: string) => void;
  isReadOnly: boolean;
};

export const CoreAgentTriggerConditionInput = ({
  objectMetadataItem,
  condition,
  conditionBindings,
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
        conditionBindings={conditionBindings}
        onConditionChange={onConditionChange}
        isReadOnly={isReadOnly}
      />
    </div>
  );
};
