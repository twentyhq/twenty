import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useValidationRules } from '@/validation-rules/hooks/useValidationRules';

const VALIDATION_RULE_TABLE_GRID_TEMPLATE_COLUMNS = '1fr 1fr 80px';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledTableContainer = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledExpression = styled.span`
  font-family: ${themeCssVariables.code.font.family};
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
  const { validationRules } = useValidationRules({
    objectMetadataId: objectMetadataItem.id,
  });

  const objectNamePlural = objectMetadataItem.namePlural;

  return (
    <StyledContent>
      <StyledTableContainer>
        <Table>
          <TableRow
            gridTemplateColumns={VALIDATION_RULE_TABLE_GRID_TEMPLATE_COLUMNS}
          >
            <TableHeader>{t`Message`}</TableHeader>
            <TableHeader>{t`Condition`}</TableHeader>
            <TableHeader align="right">{t`Status`}</TableHeader>
          </TableRow>
          <TableBody>
            {validationRules.length === 0 ? (
              <StyledEmpty>{t`No rules yet.`}</StyledEmpty>
            ) : (
              validationRules.map((validationRule) => (
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
                  <TableCell color={themeCssVariables.font.color.primary}>
                    {validationRule.message}
                  </TableCell>
                  <TableCell minWidth="0" overflow="hidden">
                    <StyledExpression>
                      {validationRule.expression}
                    </StyledExpression>
                  </TableCell>
                  <TableCell align="right">
                    {validationRule.isActive ? t`Active` : t`Inactive`}
                  </TableCell>
                </TableRow>
              ))
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
