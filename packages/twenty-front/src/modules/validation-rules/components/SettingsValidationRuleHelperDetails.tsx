import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { SettingsValidationRuleExampleExpression } from '@/validation-rules/components/SettingsValidationRuleExampleExpression';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { computeValidationRuleHelperItemExamples } from '@/validation-rules/utils/computeValidationRuleHelperItemExamples';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';
import { getValidationRuleHelperItemIcon } from '@/validation-rules/utils/getValidationRuleHelperItemIcon';

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-bottom: ${themeCssVariables.spacing[1]};
`;

const StyledTitleRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

const StyledSignature = styled.span`
  font-family: ${themeCssVariables.code.font.family};
`;

const StyledSubtitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  line-height: 1.5;
`;

const StyledExample = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  line-height: 24px;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

type SettingsValidationRuleHelperDetailsProps = {
  item: ValidationRuleHelperItem;
  editorFields: ValidationRuleEditorField[];
};

export const SettingsValidationRuleHelperDetails = ({
  item,
  editorFields,
}: SettingsValidationRuleHelperDetailsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();

  const ItemIcon = getValidationRuleHelperItemIcon({ item, getIcon });

  const examples = computeValidationRuleHelperItemExamples({
    item,
    fields: editorFields,
  });

  const itemIcon = (
    <ItemIcon
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.tertiary}
    />
  );

  const renderHeader = () => {
    switch (item.kind) {
      case 'field': {
        const fieldTypeConfig = isFieldTypeSupportedInSettings(item.field.type)
          ? getSettingsFieldTypeConfig(item.field.type)
          : undefined;
        const typeLabel = isDefined(fieldTypeConfig)
          ? t(fieldTypeConfig.label)
          : item.field.type;
        const ObjectIcon = getIcon(item.field.objectIconName);

        return (
          <>
            <StyledTitleRow>
              <StyledTitle>
                {itemIcon}
                {getValidationRuleEditorFieldChipLabel(item.field)}
              </StyledTitle>
              <Tag
                color="blue"
                startIcon={<ObjectIcon size={theme.icon.size.sm} />}
              >
                {item.field.objectLabelSingular}
              </Tag>
            </StyledTitleRow>
            <StyledSubtitle>{t`${typeLabel} field`}</StyledSubtitle>
          </>
        );
      }
      case 'function':
      case 'keyword':
        return (
          <>
            <StyledTitle>
              {itemIcon}
              <StyledSignature>{item.definition.signature}</StyledSignature>
            </StyledTitle>
            <StyledSubtitle>
              {item.kind === 'function' ? t`Function` : t`Keyword`}
            </StyledSubtitle>
          </>
        );
    }
  };

  const getDescription = () => {
    if (item.kind !== 'field') {
      return t(item.definition.description);
    }

    return item.field.readsRelatedRecord
      ? t`Checked only when the record this rule belongs to is saved. Editing the related record does not check it again.`
      : undefined;
  };

  const description = getDescription();

  return (
    <StyledDetails>
      <StyledHeader>{renderHeader()}</StyledHeader>
      {isDefined(description) && (
        <StyledDescription>{description}</StyledDescription>
      )}
      {examples.map((example) => (
        <StyledExample key={example}>
          <SettingsValidationRuleExampleExpression
            expression={example}
            editorFields={editorFields}
          />
        </StyledExample>
      ))}
    </StyledDetails>
  );
};
