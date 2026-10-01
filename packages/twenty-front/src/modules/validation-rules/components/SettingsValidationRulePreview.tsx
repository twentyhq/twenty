import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { VALIDATION_RULE_NOW_VARIABLE_NAME } from 'twenty-shared/constants';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  evaluateValidationRuleExpression,
  isDefined,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';
import { IconAlertTriangle, IconCheck, IconX } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { formatValidationRulePreviewValue } from '@/validation-rules/utils/formatValidationRulePreviewValue';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRulePreviewValue } from '@/validation-rules/utils/getValidationRulePreviewValue';

const StyledPreview = styled.div`
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRecord = styled.div`
  display: flex;
`;

const StyledValues = styled.div`
  column-gap: ${themeCssVariables.spacing[4]};
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  row-gap: ${themeCssVariables.spacing[1]};
`;

const StyledValueLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledValue = styled.span<{ isEmpty: boolean }>`
  color: ${({ isEmpty }) =>
    isEmpty
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledResult = styled.div<{ color: string }>`
  align-items: center;
  color: ${({ color }) => color};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledMuted = styled.div`
  color: ${themeCssVariables.font.color.light};
`;

type SettingsValidationRulePreviewProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
  expression: string;
  message: string;
  record: ObjectRecord | undefined;
};

export const SettingsValidationRulePreview = ({
  objectMetadataItem,
  fields,
  editorFields,
  expression,
  message,
  record,
}: SettingsValidationRulePreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  const compilationResult = compileValidationRuleExpression({
    expression,
    fields,
  });

  if (!isDefined(record)) {
    return (
      <Card.Root fullWidth>
        <Card.Content>
          <StyledMuted>
            {t`Create a few ${objectMetadataItem.labelPlural} to preview this rule on real records.`}
          </StyledMuted>
        </Card.Content>
      </Card.Root>
    );
  }

  const referencedPaths = compilationResult.isValid
    ? [
        ...new Set(
          parseValidationRuleExpression(expression).variables({
            withMembers: true,
          }),
        ),
      ].filter((path) => path !== VALIDATION_RULE_NOW_VARIABLE_NAME)
    : [];

  const renderResult = () => {
    if (!compilationResult.isValid) {
      return (
        <StyledMuted>{t`Write a valid condition to see the result.`}</StyledMuted>
      );
    }

    const evaluationResult = evaluateValidationRuleExpression({
      expression,
      record,
      fields,
      now: new Date().toISOString(),
    });

    switch (evaluationResult.status) {
      case 'passed':
        return (
          <StyledResult color={themeCssVariables.color.green}>
            <IconCheck size={theme.icon.size.md} />
            {t`Passes. This record can be saved.`}
          </StyledResult>
        );
      case 'failed':
        return (
          <StyledResult color={themeCssVariables.color.red}>
            <IconX size={theme.icon.size.md} />
            {isNonEmptyString(message.trim())
              ? t`Blocked: ${message}`
              : t`Blocked. This record could not be saved.`}
          </StyledResult>
        );
      case 'errored':
        return (
          <StyledResult color={themeCssVariables.color.orange}>
            <IconAlertTriangle size={theme.icon.size.md} />
            {evaluationResult.errorMessage}
          </StyledResult>
        );
    }
  };

  return (
    <Card.Root fullWidth>
      <Card.Content>
        <StyledPreview>
          <StyledRecord>
            <RecordChip
              objectNameSingular={objectMetadataItem.nameSingular}
              record={record}
              forceDisableClick
            />
          </StyledRecord>
          {referencedPaths.length > 0 && (
            <StyledValues>
              {referencedPaths.map((path) => {
                const editorField = editorFields.find(
                  (candidate) => candidate.path === path,
                );
                const formattedValue = formatValidationRulePreviewValue(
                  getValidationRulePreviewValue(record, path),
                );

                return [
                  <StyledValueLabel key={`${path}-label`}>
                    {isDefined(editorField)
                      ? getValidationRuleEditorFieldChipLabel(editorField)
                      : path}
                  </StyledValueLabel>,
                  <StyledValue
                    key={`${path}-value`}
                    isEmpty={formattedValue.length === 0}
                  >
                    {formattedValue.length > 0 ? formattedValue : t`Empty`}
                  </StyledValue>,
                ];
              })}
            </StyledValues>
          )}
          {renderResult()}
        </StyledPreview>
      </Card.Content>
    </Card.Root>
  );
};
