import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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
import { IconChevronDown, IconChevronUp, useIcons } from 'twenty-ui/icon';
import { Status } from 'twenty-ui/primitives/data-display';
import { Card, Tooltip } from 'twenty-ui/primitives/surfaces';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { generateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromObject';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { buildValidationRulePreviewRelationGqlFields } from '@/validation-rules/utils/buildValidationRulePreviewRelationGqlFields';
import { formatValidationRulePreviewValue } from '@/validation-rules/utils/formatValidationRulePreviewValue';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRulePreviewValue } from '@/validation-rules/utils/getValidationRulePreviewValue';

const PREVIEW_RECORD_COUNT = 3;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  min-width: 0;
`;

const StyledTitle = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledRecord = styled.div`
  display: flex;
  min-width: 0;
  overflow: hidden;
`;

const StyledStatus = styled.span`
  flex-shrink: 0;
`;

const StyledNavigation = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[1]};
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

const StyledFieldLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 50%;
  min-width: 0;
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
};

export const SettingsValidationRulePreview = ({
  objectMetadataItem,
  fields,
  editorFields,
  expression,
}: SettingsValidationRulePreviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
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
          <StyledStatus>
            <Status color="green">{t`Allowed`}</Status>
          </StyledStatus>
        );
      case 'failed':
        return (
          <StyledStatus>
            <Status color="red">{t`Rejected`}</Status>
          </StyledStatus>
        );
      case 'errored':
        return (
          <Tooltip
            delay={TooltipDelay.mediumDelay}
            content={evaluationResult.errorMessage}
            side="top"
          >
            <StyledStatus tabIndex={0}>
              <Status color="orange">{t`Error`}</Status>
            </StyledStatus>
          </Tooltip>
        );
    }
  };

  const displayedRecordNumber = records.indexOf(record) + 1;
  const recordCount = records.length;

  return (
    <Card.Root fullWidth>
      <Card.Content>
        <StyledHeader>
          <StyledTitle>
            <StyledRecord>
              <RecordChip
                objectNameSingular={objectMetadataItem.nameSingular}
                record={record}
                forceDisableClick
              />
            </StyledRecord>
            {renderStatus()}
          </StyledTitle>
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
        <StyledFieldValues>
          {referencedPaths.length === 0 ? (
            <StyledMuted>
              {compilationResult.isValid
                ? t`This condition doesn't read any field.`
                : t`Fields used in the condition show their values here.`}
            </StyledMuted>
          ) : (
            referencedPaths.map((path) => {
              const editorField = editorFields.find(
                (candidate) => candidate.path === path,
              );
              const fieldLabel = isDefined(editorField)
                ? getValidationRuleEditorFieldChipLabel(editorField)
                : path;
              const FieldIcon = isDefined(editorField)
                ? getIcon(editorField.iconName)
                : undefined;
              const formattedValue = formatValidationRulePreviewValue(
                getValidationRulePreviewValue(record, path),
              );

              return (
                <StyledFieldValue key={path}>
                  <StyledFieldLabel>
                    {isDefined(FieldIcon) && (
                      <FieldIcon
                        size={theme.icon.size.md}
                        stroke={theme.icon.stroke.sm}
                      />
                    )}
                    <OverflowingTextWithTooltip
                      text={t`${fieldLabel}:`}
                      isFocusable
                    />
                  </StyledFieldLabel>
                  <StyledValue isEmpty={formattedValue.length === 0}>
                    {formattedValue.length > 0 ? formattedValue : t`Empty`}
                  </StyledValue>
                </StyledFieldValue>
              );
            })
          )}
        </StyledFieldValues>
      </Card.Content>
    </Card.Root>
  );
};
