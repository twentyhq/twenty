import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/icon';
import { Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { getSettingsFieldTypeConfig } from '@/settings/data-model/utils/getSettingsFieldTypeConfig';
import { isFieldTypeSupportedInSettings } from '@/settings/data-model/utils/isFieldTypeSupportedInSettings';
import { SettingsValidationRuleExpressionText } from '@/validation-rules/components/SettingsValidationRuleExpressionText';
import { SettingsValidationRuleHelperItemIcon } from '@/validation-rules/components/SettingsValidationRuleHelperItemIcon';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';
import { type ValidationRuleHelperItem } from '@/validation-rules/types/ValidationRuleHelperItem';
import { computeValidationRuleHelperItemExamples } from '@/validation-rules/utils/computeValidationRuleHelperItemExamples';
import { getValidationRuleEditorFieldChipLabel } from '@/validation-rules/utils/getValidationRuleEditorFieldChipLabel';

const StyledDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTitle = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSignature = styled.span`
  font-family: ${themeCssVariables.code.font.family};
`;

const StyledMeta = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  line-height: 1.5;
`;

const StyledExamplesTitle = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledExample = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
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

  const examples = computeValidationRuleHelperItemExamples({
    item,
    fields: editorFields,
  });

  const renderSummary = () => {
    switch (item.kind) {
      case 'field': {
        const typeLabel = isFieldTypeSupportedInSettings(item.field.type)
          ? (getSettingsFieldTypeConfig(item.field.type)?.label ??
            item.field.type)
          : item.field.type;
        const ObjectIcon = getIcon(item.field.objectIconName);

        return (
          <>
            <StyledTitle>
              <SettingsValidationRuleHelperItemIcon item={item} />
              {getValidationRuleEditorFieldChipLabel(item.field)}
            </StyledTitle>
            <StyledMeta>
              {t`${typeLabel} field`}
              <Tag
                color="gray"
                startIcon={<ObjectIcon size={theme.icon.size.sm} />}
              >
                {item.field.objectLabelSingular}
              </Tag>
            </StyledMeta>
            {item.field.readsRelatedRecord && (
              <StyledDescription>
                {t`Checked only when the record this rule belongs to is saved. Editing the related record does not check it again.`}
              </StyledDescription>
            )}
          </>
        );
      }
      case 'function':
      case 'keyword':
        return (
          <>
            <StyledTitle>
              <SettingsValidationRuleHelperItemIcon item={item} />
              <StyledSignature>{item.definition.signature}</StyledSignature>
            </StyledTitle>
            <StyledMeta>
              {item.kind === 'function' ? t`Function` : t`Keyword`}
            </StyledMeta>
            <StyledDescription>
              {t(item.definition.description)}
            </StyledDescription>
          </>
        );
    }
  };

  return (
    <StyledDetails>
      {renderSummary()}
      {examples.length > 0 && (
        <>
          <StyledExamplesTitle>{t`Examples`}</StyledExamplesTitle>
          {examples.map((example) => (
            <StyledExample key={example}>
              <SettingsValidationRuleExpressionText expression={example} />
            </StyledExample>
          ))}
        </>
      )}
    </StyledDetails>
  );
};
