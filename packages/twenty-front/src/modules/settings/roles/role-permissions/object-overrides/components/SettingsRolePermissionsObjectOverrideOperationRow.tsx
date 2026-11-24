import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectFieldsSelect } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectFieldsSelect';
import { SettingsRolePermissionsObjectOverrideActionContainer } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideActionContainer';
import { SettingsRolePermissionsObjectOverrideSelectContainer } from '@/settings/roles/role-permissions/object-overrides/components/SettingsRolePermissionsObjectOverrideSelectContainer';
import { OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS } from '@/settings/roles/role-permissions/object-overrides/constants/ObjectOverridePanelGridTemplateColumns';
import {
  SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG,
  type SettingsRoleObjectPermissionKey,
} from '@/settings/roles/role-permissions/object-overrides/constants/SettingsRoleObjectPermissionIconConfig';
import { useObjectDisabledOperations } from '@/settings/roles/role-permissions/object-overrides/hooks/useObjectDisabledOperations';
import { useSettingsRoleObjectOverrides } from '@/settings/roles/role-permissions/object-overrides/hooks/useSettingsRoleObjectOverrides';
import { getObjectOperations } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperations';
import { getObjectOperationsWithReadDependency } from '@/settings/roles/role-permissions/object-overrides/utils/getObjectOperationsWithReadDependency';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Checkbox } from 'twenty-ui/primitives/input';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledActionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex-shrink: 0;
`;

type SettingsRolePermissionsObjectOverrideOperationRowProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  operation: SettingsRoleObjectPermissionKey;
  hint?: string | null;
  isEditable: boolean;
  isOperationEnabled: boolean;
};

export const SettingsRolePermissionsObjectOverrideOperationRow = ({
  roleId,
  objectMetadataItem,
  operation,
  hint,
  isEditable,
  isOperationEnabled,
}: SettingsRolePermissionsObjectOverrideOperationRowProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const { setObjectOperations } = useSettingsRoleObjectOverrides(roleId);
  const { disabledOperations } =
    useObjectDisabledOperations(objectMetadataItem);

  const operations = getObjectOperations({
    role: settingsDraftRole,
    objectMetadataId: objectMetadataItem.id,
    disabledOperations,
  });
  const isChecked = operations.includes(operation);

  const handleToggle = () => {
    setObjectOperations({
      objectMetadataId: objectMetadataItem.id,
      operations: getObjectOperationsWithReadDependency({
        previousOperations: operations,
        nextOperations: isChecked
          ? operations.filter(
              (selectedOperation) => selectedOperation !== operation,
            )
          : [...operations, operation],
        disabledOperations,
      }),
    });
  };
  const { Icon, label } =
    SETTINGS_ROLE_OBJECT_PERMISSION_ICON_CONFIG[operation];

  const hasFieldsSelect =
    !objectMetadataItem.isSystem &&
    (operation === 'canReadObjectRecords' ||
      operation === 'canUpdateObjectRecords');

  return (
    <TableRow gridTemplateColumns={OBJECT_OVERRIDE_PANEL_GRID_TEMPLATE_COLUMNS}>
      <TableCell gap={themeCssVariables.spacing[2]} overflow="hidden">
        <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        <StyledActionLabel>{t(label)}</StyledActionLabel>
        {isNonEmptyString(hint) && (
          <OverflowingTextWithTooltip color="tertiary" text={`· ${hint}`} />
        )}
      </TableCell>
      <TableCell padding={`0 0 0 ${themeCssVariables.spacing[2]}`}>
        {hasFieldsSelect && (
          <SettingsRolePermissionsObjectOverrideSelectContainer>
            <SettingsRolePermissionsObjectFieldsSelect
              roleId={roleId}
              objectMetadataItem={objectMetadataItem}
              mode={operation === 'canReadObjectRecords' ? 'read' : 'update'}
              disabled={!isEditable || !isChecked}
            />
          </SettingsRolePermissionsObjectOverrideSelectContainer>
        )}
      </TableCell>
      <TableCell
        align="right"
        padding={`0 ${themeCssVariables.spacing[1]} 0 0`}
      >
        <SettingsRolePermissionsObjectOverrideActionContainer>
          <Checkbox
            aria-label={t(label)}
            checked={isChecked}
            disabled={!isEditable || !isOperationEnabled}
            onCheckedChange={handleToggle}
          />
        </SettingsRolePermissionsObjectOverrideActionContainer>
      </TableCell>
    </TableRow>
  );
};
