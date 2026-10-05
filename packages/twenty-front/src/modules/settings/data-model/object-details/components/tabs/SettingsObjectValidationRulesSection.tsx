import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  getSettingsPath,
  renderValidationRuleExpression,
} from 'twenty-shared/utils';
import { IconPlus, useIcons } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { SettingsValidationRuleExpressionText } from '@/validation-rules/components/SettingsValidationRuleExpressionText';
import { VALIDATION_RULE_DEFAULT_ICON } from '@/validation-rules/constants/ValidationRuleDefaultIcon';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';

const VALIDATION_RULE_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 1fr 80px';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledNameCell = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledName = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledExpression = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmpty = styled.div`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.md};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsObjectValidationRulesSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

export const SettingsObjectValidationRulesSection = ({
  objectMetadataItem,
  isReadOnly,
}: SettingsObjectValidationRulesSectionProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { validationRules } = useValidationRules({
    objectMetadataId: objectMetadataItem.id,
  });

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
    includesInactiveFields: true,
  });

  const objectNamePlural = objectMetadataItem.namePlural;

  return (
    <StyledContent>
      <StyledTableContainer>
        <Table>
          <TableRow
            gridTemplateColumns={VALIDATION_RULE_TABLE_GRID_TEMPLATE_COLUMNS}
          >
            <TableHeader>{t`Name`}</TableHeader>
            <TableHeader>{t`Condition`}</TableHeader>
            <TableHeader align="right">{t`Status`}</TableHeader>
          </TableRow>
          <TableBody>
            {validationRules.length === 0 ? (
              <StyledEmpty>{t`No rules yet.`}</StyledEmpty>
            ) : (
              validationRules.map((validationRule) => {
                const RuleIcon = getIcon(
                  validationRule.icon ?? VALIDATION_RULE_DEFAULT_ICON,
                );

                return (
                  <TableRow
                    key={validationRule.id}
                    gridTemplateColumns={
                      VALIDATION_RULE_TABLE_GRID_TEMPLATE_COLUMNS
                    }
                    to={getSettingsPath(SettingsPath.ObjectValidationRuleEdit, {
                      objectNamePlural,
                      validationRuleId: validationRule.id,
                    })}
                  >
                    <TableCell
                      color={themeCssVariables.font.color.primary}
                      minWidth="0"
                      overflow="hidden"
                    >
                      <StyledNameCell>
                        <RuleIcon size={theme.icon.size.md} />
                        <StyledName>{validationRule.name}</StyledName>
                      </StyledNameCell>
                    </TableCell>
                    <TableCell minWidth="0" overflow="hidden">
                      <StyledExpression>
                        <SettingsValidationRuleExpressionText
                          expression={renderValidationRuleExpression({
                            expression: validationRule.expression,
                            bindings: validationRule.bindings,
                            fields,
                          })}
                        />
                      </StyledExpression>
                    </TableCell>
                    <TableCell align="right">
                      {validationRule.isActive ? t`Active` : t`Inactive`}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>
      {!isReadOnly && (
        <StyledButtonContainer>
          <NavigationButton
            to={getSettingsPath(SettingsPath.ObjectNewValidationRule, {
              objectNamePlural,
            })}
            startIcon={<IconPlus />}
            size="sm"
            variant="outline"
          >{t`Add rule`}</NavigationButton>
        </StyledButtonContainer>
      )}
    </StyledContent>
  );
};
