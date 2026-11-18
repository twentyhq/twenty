import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/objects-permissions/constants/ObjectOverrideTableGridTemplateColumns';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/objects-permissions/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperations';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectOperationsWithReadDependency';
import { getObjectRowLevelPermissionPredicates } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionPredicates';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconChevronRight } from 'twenty-ui/icon';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS};
`;

const StyledActionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} 0 ${themeCssVariables.spacing[1]};
`;

type SettingsRolePermissionsObjectOverridePanelProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectOverridePanel = ({
  roleId,
  objectMetadataItem,
  isEditable,
}: SettingsRolePermissionsObjectOverridePanelProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();
  const theme = useTheme();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const { removeObjectOverride } = useSettingsRoleObjectOverrides(roleId);

  const hasRule =
    getObjectRowLevelPermissionPredicates({
      role: settingsDraftRole,
      objectMetadataId: objectMetadataItem.id,
    }).length > 0;

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  const setOperations = (nextOperations: SettingsRoleObjectPermissionKey[]) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermission) =>
        objectPermission.objectMetadataId === objectMetadataItem.id,
    );

    upsertObjectPermissionInDraftRole({
      ...existingObjectPermission,
      objectMetadataId: objectMetadataItem.id,
      canReadObjectRecords: nextOperations.includes('canReadObjectRecords'),
      canUpdateObjectRecords: nextOperations.includes('canUpdateObjectRecords'),
      canSoftDeleteObjectRecords: nextOperations.includes(
        'canSoftDeleteObjectRecords',
      ),
      canDestroyObjectRecords: nextOperations.includes(
        'canDestroyObjectRecords',
      ),
    });
  };

  const toggleOperation = (key: SettingsRoleObjectPermissionKey) => {
    const nextOperations = operations.includes(key)
      ? operations.filter((operation) => operation !== key)
      : [...operations, key];

    setOperations(
      getObjectOperationsWithReadDependency({
        previousOperations: operations,
        nextOperations,
      }),
    );
  };

  const openObjectPage = () => {
    navigateSettings(SettingsPath.RoleObjectLevel, {
      roleId,
      objectMetadataId: objectMetadataItem.id,
    });
  };

  return (
    <StyledPanel>
      <StyledHeaderRow>
        <TableHeader>
          {hasRule ? t`Records matching the rule` : t`All records`}
        </TableHeader>
        <TableHeader />
        <TableHeader align="right">{t`Allows`}</TableHeader>
      </StyledHeaderRow>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key];

        return (
          <TableRow
            key={key}
            gridTemplateColumns={OBJECT_OVERRIDE_TABLE_GRID_TEMPLATE_COLUMNS}
            onClick={isEditable ? () => toggleOperation(key) : undefined}
          >
            <TableCell gap={themeCssVariables.spacing[2]}>
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              <StyledActionLabel>
                {t(SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label)}
              </StyledActionLabel>
            </TableCell>
            <TableCell />
            <TableCell align="right">
              <Checkbox
                aria-label={t(
                  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key].label,
                )}
                checked={operations.includes(key)}
                disabled={!isEditable}
                hoverable={false}
                onClick={(event) => event.stopPropagation()}
                onCheckedChange={() => toggleOperation(key)}
              />
            </TableCell>
          </TableRow>
        );
      })}
      {isEditable && (
        <StyledFooter>
          <Button
            size="sm"
            variant="outline"
            onClick={() => removeObjectOverride(objectMetadataItem.id)}
          >
            {t`Remove override`}
          </Button>
          <Button
            size="sm"
            variant="outline"
            endIcon={<IconChevronRight />}
            onClick={openObjectPage}
          >
            {t`Fields and rule`}
          </Button>
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
