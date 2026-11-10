import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Card } from 'twenty-ui/primitives/surfaces';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { SettingsValidationRuleExpressionText } from '@/validation-rules/components/SettingsValidationRuleExpressionText';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

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
  const { objectMetadataItems } = useObjectMetadataItems();

  if (isReadOnly && !isNonEmptyString(condition)) {
    return null;
  }

  return (
    <div>
      <InputLabel>{t`Condition (Optional)`}</InputLabel>
      {isReadOnly ? (
        <SettingsValidationRuleExpressionText expression={condition} />
      ) : (
        <Card.Root fullWidth>
          <SettingsValidationRuleExpressionEditor
            value={condition}
            fields={buildValidationRuleFieldDescriptors({
              objectMetadataItem,
              objectMetadataItems,
              scope: 'databaseEvent',
            })}
            editorFields={buildValidationRuleEditorFields({
              objectMetadataItem,
              objectMetadataItems,
              scope: 'databaseEvent',
            })}
            onChange={onConditionChange}
          />
        </Card.Root>
      )}
    </div>
  );
};
