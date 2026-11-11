import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { SettingsRolePermissionsObjectActionsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectActionsSelect';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/objects-permissions/components/SettingsRolePermissionsObjectFieldsSelect';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionIconConfig';
import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectLevelPermissionToRoleObjectPermissionMapping';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectPermissionActionLabel } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionActionLabel';
import { getObjectPermissionKeysWithReadDependency } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionKeysWithReadDependency';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { IconChevronRight, IconPlus } from 'twenty-ui/icon';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const PANEL_GRID_TEMPLATE_COLUMNS = '1fr 1fr 36px';

const StyledPanel = styled.div`
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  margin: ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};
`;

const StyledHeaderRow = styled.div`
  display: grid;
  grid-template-columns: ${PANEL_GRID_TEMPLATE_COLUMNS};
`;

const StyledActionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

const StyledActionDescription = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  min-width: 0;
  overflow: hidden;
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
  ruleLabel: string;
  onRemove: () => void;
  fromAgentId?: string;
};

export const SettingsRolePermissionsObjectOverridePanel = ({
  roleId,
  objectMetadataItem,
  isEditable,
  ruleLabel,
  onRemove,
  fromAgentId,
}: SettingsRolePermissionsObjectOverridePanelProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigateSettings = useNavigateSettings();

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const hasRule = (settingsDraftRole.rowLevelPermissionPredicates ?? []).some(
    (predicate) => predicate.objectMetadataId === objectMetadataItem.id,
  );

  const grantedKeys = getGrantedObjectPermissionKeys({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
  });

  // a grant equal to the all-objects one stays inherited, so it keeps following that setting
  const setGrantedKeys = (
    nextGrantedKeys: SettingsRoleObjectPermissionKey[],
  ) => {
    const existingObjectPermission = settingsDraftRole.objectPermissions?.find(
      (objectPermission) =>
        objectPermission.objectMetadataId === objectMetadataItem.id,
    );

    const objectGrants = Object.fromEntries(
      SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const isGranted = nextGrantedKeys.includes(key);
        const allObjectsGrant =
          settingsDraftRole[
            SETTINGS_ROLE_OBJECT_LEVEL_PERMISSION_TO_ROLE_OBJECT_PERMISSION_MAPPING[
              key
            ]
          ];

        return [key, isGranted === allObjectsGrant ? null : isGranted];
      }),
    );

    upsertObjectPermissionInDraftRole({
      ...existingObjectPermission,
      objectMetadataId: objectMetadataItem.id,
      ...objectGrants,
    });
  };

  const toggleKey = (key: SettingsRoleObjectPermissionKey) => {
    const nextKeys = grantedKeys.includes(key)
      ? grantedKeys.filter((grantedKey) => grantedKey !== key)
      : [...grantedKeys, key];

    setGrantedKeys(
      getObjectPermissionKeysWithReadDependency({
        previousKeys: grantedKeys,
        nextKeys,
      }),
    );
  };

  const openRuleEditor = () => {
    navigateSettings(
      SettingsPath.RoleObjectLevel,
      { roleId, objectMetadataId: objectMetadataItem.id },
      fromAgentId ? { fromAgent: fromAgentId } : undefined,
    );
  };

  const objectLabelPlural = objectMetadataItem.labelPlural.toLocaleLowerCase();

  return (
    <StyledPanel>
      <StyledHeaderRow>
        <TableHeader>{t`All records`}</TableHeader>
        <TableHeader>{t`Allows`}</TableHeader>
        <TableHeader />
      </StyledHeaderRow>
      {SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.map((key) => {
        const { Icon } = SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[key];
        const isGranted = !hasRule && grantedKeys.includes(key);
        const isFieldsSelectShown =
          key === 'canReadObjectRecords' || key === 'canUpdateObjectRecords';

        return (
          <TableRow key={key} gridTemplateColumns={PANEL_GRID_TEMPLATE_COLUMNS}>
            <TableCell gap={themeCssVariables.spacing[2]} overflow="hidden">
              <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
              <StyledActionLabel>
                {getObjectPermissionActionLabel(key)}
              </StyledActionLabel>
              {hasRule && (
                <StyledActionDescription>
                  <OverflowingTextWithTooltip
                    text={t`· Only ${objectLabelPlural} matching the rule below`}
                  />
                </StyledActionDescription>
              )}
            </TableCell>
            <TableCell>
              {isFieldsSelectShown && (
                <SettingsRolePermissionsObjectFieldsSelect
                  roleId={roleId}
                  objectMetadataItem={objectMetadataItem}
                  mode={key === 'canReadObjectRecords' ? 'read' : 'update'}
                  disabled={!isEditable || !grantedKeys.includes(key)}
                />
              )}
            </TableCell>
            <TableCell align="right">
              <Checkbox
                checked={isGranted}
                disabled={!isEditable || hasRule}
                onCheckedChange={() => toggleKey(key)}
              />
            </TableCell>
          </TableRow>
        );
      })}
      {hasRule && (
        <>
          <StyledHeaderRow>
            <TableHeader>{t`Some records`}</TableHeader>
            <TableHeader>{t`Allows`}</TableHeader>
            <TableHeader />
          </StyledHeaderRow>
          <TableRow
            gridTemplateColumns={PANEL_GRID_TEMPLATE_COLUMNS}
            onClick={isEditable ? openRuleEditor : undefined}
          >
            <TableCell
              color={themeCssVariables.font.color.primary}
              overflow="hidden"
            >
              <OverflowingTextWithTooltip text={ruleLabel} />
            </TableCell>
            <TableCell onClick={(event) => event.stopPropagation()}>
              <SettingsRolePermissionsObjectActionsSelect
                dropdownId={`settings-role-object-rule-actions-${objectMetadataItem.id}`}
                selectedKeys={grantedKeys}
                onChange={setGrantedKeys}
                disabled={!isEditable}
              />
            </TableCell>
            <TableCell
              align="right"
              color={themeCssVariables.font.color.tertiary}
            >
              {isEditable && <IconChevronRight size={theme.icon.size.md} />}
            </TableCell>
          </TableRow>
        </>
      )}
      {isEditable && (
        <StyledFooter>
          <Button size="sm" variant="outline" onClick={onRemove}>
            {t`Remove override`}
          </Button>
          {!hasRule && (
            <Button
              size="sm"
              variant="outline"
              startIcon={<IconPlus />}
              onClick={openRuleEditor}
            >
              {t`New rule`}
            </Button>
          )}
        </StyledFooter>
      )}
    </StyledPanel>
  );
};
