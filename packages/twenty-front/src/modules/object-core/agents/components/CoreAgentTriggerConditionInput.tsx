import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useMemo } from 'react';
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

  // The editor is controlled, so these would otherwise be rebuilt on every keystroke
  const fields = useMemo(
    () =>
      buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
        scope: 'databaseEvent',
      }),
    [objectMetadataItem, objectMetadataItems],
  );
  const editorFields = useMemo(
    () =>
      buildValidationRuleEditorFields({
        objectMetadataItem,
        objectMetadataItems,
        scope: 'databaseEvent',
      }),
    [objectMetadataItem, objectMetadataItems],
  );

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
            fields={fields}
            editorFields={editorFields}
            onChange={onConditionChange}
          />
        </Card.Root>
      )}
    </div>
  );
};
