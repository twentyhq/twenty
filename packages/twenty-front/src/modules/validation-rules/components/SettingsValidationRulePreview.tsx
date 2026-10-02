import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { VALIDATION_RULE_NOW_VARIABLE_NAME } from 'twenty-shared/constants';
import {
  type ValidationRuleCompilationResult,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  evaluateValidationRuleExpression,
  isDefined,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';
import { IconCheck, IconX, useIcons } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { SettingsDataModelObjectPreview } from '@/settings/data-model/objects/components/SettingsDataModelObjectSummary';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { formatValidationRulePreviewValue } from '@/validation-rules/utils/formatValidationRulePreviewValue';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRulePreviewValue } from '@/validation-rules/utils/getValidationRulePreviewValue';

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledObjectPreview = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledStatus = styled.span`
  display: flex;
  flex-shrink: 0;
`;

const StyledFieldValues = styled.div`
  background-color: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  margin-top: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFieldValue = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  line-height: 24px;
  min-width: 0;
  white-space: nowrap;
`;

const StyledFieldLabel = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 50%;
  min-width: 0;
`;

const StyledFieldLabelText = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledValue = styled.span<{ isEmpty: boolean }>`
  color: ${({ isEmpty }) =>
    isEmpty
      ? themeCssVariables.font.color.light
      : themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledMuted = styled.div`
  color: ${themeCssVariables.font.color.light};
`;

type SettingsValidationRulePreviewProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
  expression: string;
  compilationResult: ValidationRuleCompilationResult;
  record: ObjectRecord | undefined;
};

export const SettingsValidationRulePreview = ({
  objectMetadataItem,
  fields,
  editorFields,
  expression,
  compilationResult,
  record,
}: SettingsValidationRulePreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();

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

  const renderStatus = () => {
    if (!compilationResult.isValid) {
      return null;
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
          <StyledStatus role="img" aria-label={t`This record can be saved`}>
            <IconCheck
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.color.green}
            />
          </StyledStatus>
        );
      case 'failed':
      case 'errored':
        return (
          <StyledStatus role="img" aria-label={t`This record is blocked`}>
            <IconX
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
              color={theme.color.red}
            />
          </StyledStatus>
        );
    }
  };

  return (
    <Card.Root fullWidth>
      <Card.Content>
        <StyledHeader>
          {renderStatus()}
          <StyledObjectPreview>
            <SettingsDataModelObjectPreview
              objectMetadataItems={[objectMetadataItem]}
            />
          </StyledObjectPreview>
        </StyledHeader>
        {referencedPaths.length > 0 && (
          <StyledFieldValues>
            {referencedPaths.map((path) => {
              const editorField = editorFields.find(
                (candidate) => candidate.path === path,
              );
              const fieldLabel = isDefined(editorField)
                ? getValidationRuleEditorFieldChipLabel(editorField)
                : path;
              const FieldIcon = getIcon(editorField?.iconName);
              const formattedValue = formatValidationRulePreviewValue(
                getValidationRulePreviewValue(record, path),
              );

              return (
                <StyledFieldValue key={path}>
                  <StyledFieldLabel>
                    <FieldIcon
                      size={theme.icon.size.md}
                      stroke={theme.icon.stroke.sm}
                    />
                    <StyledFieldLabelText>{t`${fieldLabel}:`}</StyledFieldLabelText>
                  </StyledFieldLabel>
                  <StyledValue isEmpty={formattedValue.length === 0}>
                    {formattedValue.length > 0 ? formattedValue : t`Empty`}
                  </StyledValue>
                </StyledFieldValue>
              );
            })}
          </StyledFieldValues>
        )}
      </Card.Content>
    </Card.Root>
  );
};
