import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsOrganizationPlanUpgradeCard } from '@/settings/roles/role-permissions/object-level-permissions/components/SettingsRolePermissionsOrganizationPlanUpgradeCard';
import { SettingsRolePermissionsObjectLevelRelatedRecordRow } from '@/settings/roles/role-permissions/object-level-permissions/related-records/components/SettingsRolePermissionsObjectLevelRelatedRecordRow';
import { SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdown } from '@/settings/roles/role-permissions/object-level-permissions/related-records/components/SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdown';
import { RELATED_RECORDS_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-level-permissions/related-records/constants/RelatedRecordsTableGridTemplateColumns';
import { useRecordInheritanceRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/hooks/useRecordInheritanceRules';
import { getRelatedRecordsRules } from '@/settings/roles/role-permissions/object-level-permissions/related-records/utils/getRelatedRecordsRules';
import { OrganizationAdornment } from '@/settings/enterprise/components/OrganizationAdornment';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableFooter } from '@/ui/layout/table/components/TableFooter';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledTableRows = styled.div`
  padding-bottom: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRelatedRecordsSectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
  hasOrganizationPlan: boolean;
};

export const SettingsRolePermissionsObjectLevelRelatedRecordsSection = ({
  objectMetadataItem,
  roleId,
  hasOrganizationPlan,
}: SettingsRolePermissionsObjectLevelRelatedRecordsSectionProps) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { objectMetadataItems } = useObjectMetadataItems();
  const {
    recordInheritanceRules,
    createRecordInheritanceRule,
    deleteRecordInheritanceRule,
  } = useRecordInheritanceRules({ skip: !hasOrganizationPlan });

  const roleLabel = settingsDraftRole.label;
  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();
  const isEditable = settingsDraftRole.isEditable;

  const header = (
    <Section.Header
      title={t`Related records`}
      description={t`Records that follow ${objectLabelPlural}: when ${roleLabel} can't see one, it can't see its related records either. Rules are set on the object and apply to every role.`}
      actions={hasOrganizationPlan ? undefined : <OrganizationAdornment />}
    />
  );

  if (!hasOrganizationPlan) {
    return (
      <Section.Root>
        {header}
        <SettingsRolePermissionsOrganizationPlanUpgradeCard />
      </Section.Root>
    );
  }

  const { rules, availableRules } = getRelatedRecordsRules({
    parentObjectMetadataId: objectMetadataItem.id,
    objectMetadataItems,
    recordInheritanceRules,
  });

  return (
    <Section.Root>
      {header}
      <Table>
        <TableRow
          gridTemplateColumns={RELATED_RECORDS_TABLE_GRID_TEMPLATE_COLUMNS}
        >
          <TableHeader>{t`Object`}</TableHeader>
          <TableHeader>{t`Relation`}</TableHeader>
          <TableHeader>{t`Type`}</TableHeader>
          <TableHeader />
        </TableRow>
        <StyledTableRows>
          {isNonEmptyArray(rules) ? (
            rules.map((rule) => (
              <SettingsRolePermissionsObjectLevelRelatedRecordRow
                key={rule.key}
                rule={rule}
                isLocked={!isDefined(rule.recordInheritanceRuleId)}
                isEditable={isEditable}
                onRemove={() => {
                  if (isDefined(rule.recordInheritanceRuleId)) {
                    void deleteRecordInheritanceRule(
                      rule.recordInheritanceRuleId,
                    );
                  }
                }}
              />
            ))
          ) : (
            <TableCell color={themeCssVariables.font.color.tertiary}>
              {t`No related records rules.`}
            </TableCell>
          )}
        </StyledTableRows>
      </Table>
      {isEditable && (
        <TableFooter>
          <SettingsRolePermissionsObjectLevelRelatedRecordsAddRuleDropdown
            availableRules={availableRules}
            disabled={!isNonEmptyArray(availableRules)}
            onAddRule={(rule) =>
              void createRecordInheritanceRule({
                objectMetadataId: rule.childObjectMetadataItem.id,
                fieldMetadataId: rule.fieldMetadataId,
                junctionFieldMetadataId: rule.junctionFieldMetadataId,
              })
            }
          />
        </TableFooter>
      )}
    </Section.Root>
  );
};
