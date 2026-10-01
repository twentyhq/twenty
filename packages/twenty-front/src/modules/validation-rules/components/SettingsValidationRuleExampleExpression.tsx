import { isDefined } from 'twenty-shared/utils';

import { SettingsValidationRuleExpressionText } from '@/validation-rules/components/SettingsValidationRuleExpressionText';
import { SettingsValidationRuleFieldChip } from '@/validation-rules/components/SettingsValidationRuleFieldChip';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { computeValidationRuleEditorSegments } from '@/validation-rules/utils/computeValidationRuleEditorSegments';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';

type SettingsValidationRuleExampleExpressionProps = {
  expression: string;
  editorFields: ValidationRuleEditorField[];
};

export const SettingsValidationRuleExampleExpression = ({
  expression,
  editorFields,
}: SettingsValidationRuleExampleExpressionProps) => {
  const findEditorField = (path: string) =>
    editorFields.find((editorField) => editorField.path === path);

  const segments = computeValidationRuleEditorSegments({
    expression,
    isFieldPath: (path) => isDefined(findEditorField(path)),
    cursorOffset: null,
    fieldRanges: [],
  });

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.type === 'text') {
          return (
            <SettingsValidationRuleExpressionText
              key={index}
              expression={segment.text}
            />
          );
        }

        const editorField = findEditorField(segment.path);

        return isDefined(editorField) ? (
          <SettingsValidationRuleFieldChip
            key={index}
            path={editorField.path}
            label={getValidationRuleEditorFieldChipLabel(editorField)}
            iconName={editorField.iconName}
          />
        ) : (
          <SettingsValidationRuleExpressionText
            key={index}
            expression={segment.path}
          />
        );
      })}
    </>
  );
};
