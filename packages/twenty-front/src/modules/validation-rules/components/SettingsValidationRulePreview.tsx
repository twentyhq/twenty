import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { VALIDATION_RULE_NOW_VARIABLE_NAME } from 'twenty-shared/constants';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import {
  compileValidationRuleExpression,
  evaluateValidationRuleExpression,
  isDefined,
  parseValidationRuleExpression,
} from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import {
  IconAlertTriangle,
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconX,
} from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { buildValidationRulePreviewRelationGqlFields } from '@/validation-rules/utils/buildValidationRulePreviewRelationGqlFields';
import { formatValidationRulePreviewValue } from '@/validation-rules/utils/formatValidationRulePreviewValue';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRulePreviewValue } from '@/validation-rules/utils/getValidationRulePreviewValue';

const PREVIEW_RECORD_COUNT = 3;

const StyledPreview = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledNavigation = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
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
};

export const SettingsValidationRulePreview = ({
  objectMetadataItem,
  fields,
  editorFields,
  expression,
  message,
}: SettingsValidationRulePreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { objectMetadataItems } = useObjectMetadataItems();
  const [recordIndex, setRecordIndex] = useState(0);

  const compilationResult = compileValidationRuleExpression({
    expression,
    fields,
  });

  const { records, loading } = useFindManyRecords({
    objectNameSingular: objectMetadataItem.nameSingular,
    limit: PREVIEW_RECORD_COUNT,
    orderBy: [{ createdAt: 'DescNullsLast' }],
    recordGqlFields: {
      ...generateDepthRecordGqlFieldsFromObject({
        objectMetadataItems,
        objectMetadataItem,
        depth: 0,
      }),
      ...buildValidationRulePreviewRelationGqlFields({
        bindingPaths: compilationResult.isValid
          ? Object.keys(compilationResult.bindings)
          : [],
        fields,
      }),
    },
  });

  if (loading) {
    return null;
  }

  const record = records[Math.min(recordIndex, records.length - 1)];

  if (!isDefined(record)) {
    return (
      <StyledPreview>
        <StyledMuted>
          {t`Create a few ${objectMetadataItem.labelPlural} to preview this rule on real records.`}
        </StyledMuted>
      </StyledPreview>
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

  const displayedRecordNumber = records.indexOf(record) + 1;
  const recordCount = records.length;

  return (
    <StyledPreview>
      <StyledHeader>
        <RecordChip
          objectNameSingular={objectMetadataItem.nameSingular}
          record={record}
          forceDisableClick
        />
        <StyledNavigation>
          {t`Record ${displayedRecordNumber} of ${recordCount}`}
          <LightIconButton
            aria-label={t`Previous record`}
            disabled={displayedRecordNumber === 1}
            onClick={() => setRecordIndex(displayedRecordNumber - 2)}
          >
            <IconChevronUp />
          </LightIconButton>
          <LightIconButton
            aria-label={t`Next record`}
            disabled={displayedRecordNumber === recordCount}
            onClick={() => setRecordIndex(displayedRecordNumber)}
          >
            <IconChevronDown />
          </LightIconButton>
        </StyledNavigation>
      </StyledHeader>
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
  );
};
