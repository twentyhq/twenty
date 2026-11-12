import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Card } from 'twenty-ui/primitives/surfaces';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';
import { ValidationRuleExpressionText } from '@/validation-rules/components/ValidationRuleExpressionText';
import { useValidationRuleFields } from '@/validation-rules/hooks/useValidationRuleFields';

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
  const { fields, editorFields } = useValidationRuleFields({
    objectMetadataItem,
  });

  if (isReadOnly && !isNonEmptyString(condition)) {
    return null;
  }

  return (
    <div>
      <InputLabel>{t`Condition (Optional)`}</InputLabel>
      {isReadOnly ? (
        <ValidationRuleExpressionText expression={condition} />
      ) : (
        <Card.Root fullWidth>
          <ValidationRuleExpressionEditor
            value={condition}
            fields={fields}
            editorFields={editorFields}
            onChange={onConditionChange}
          />
        </Card.Root>
      )}
    </div>
  );
};
