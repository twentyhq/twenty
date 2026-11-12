import { Card } from 'twenty-ui/primitives/surfaces';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ValidationRuleExpressionEditor } from '@/validation-rules/components/ValidationRuleExpressionEditor';
import { ValidationRuleExpressionText } from '@/validation-rules/components/ValidationRuleExpressionText';
import { useValidationRuleFields } from '@/validation-rules/hooks/useValidationRuleFields';

type RecordEventConditionEditorProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  condition: string;
  onConditionChange: (condition: string) => void;
  isReadOnly: boolean;
};

export const RecordEventConditionEditor = ({
  objectMetadataItem,
  condition,
  onConditionChange,
  isReadOnly,
}: RecordEventConditionEditorProps) => {
  const { fields, editorFields } = useValidationRuleFields({
    objectMetadataItem,
  });

  if (isReadOnly) {
    return <ValidationRuleExpressionText expression={condition} />;
  }

  return (
    <Card.Root fullWidth>
      <ValidationRuleExpressionEditor
        value={condition}
        fields={fields}
        editorFields={editorFields}
        onChange={onConditionChange}
      />
    </Card.Root>
  );
};
