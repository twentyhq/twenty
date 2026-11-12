import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';
import { useUpsertFieldPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/hooks/useUpsertFieldPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { MultiSelectControl } from '@/ui/input/components/MultiSelectControl';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconEye, IconEyeOff, IconPencil, IconPencilOff } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { v4 } from 'uuid';
import { type FieldPermission } from '~/generated-metadata/graphql';

type SettingsRolePermissionsObjectFieldsSelectProps = {
  roleId: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  mode: 'read' | 'update';
  ruleRootGroupId?: string;
  disabled?: boolean;
};

export const SettingsRolePermissionsObjectFieldsSelect = ({
  roleId,
  objectMetadataItem,
  mode,
  ruleRootGroupId,
  disabled = false,
}: SettingsRolePermissionsObjectFieldsSelectProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInputValue, setSearchInputValue] = useState('');

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertFieldPermissionInDraftRole } =
    useUpsertFieldPermissionInDraftRole(roleId);

  const fieldPermissions =
    settingsDraftRole.fieldPermissions?.filter(
      (fieldPermission) =>
        fieldPermission.objectMetadataId === objectMetadataItem.id &&
        (fieldPermission.rowLevelPermissionPredicateGroupId ?? null) ===
          (ruleRootGroupId ?? null),
    ) ?? [];

  const fieldMetadataItems = objectMetadataItem.fields
    .filter(filterUserFacingFieldMetadataItems)
    .sort((fieldA, fieldB) => fieldA.label.localeCompare(fieldB.label));

  const getFieldPermission = (fieldMetadataId: string) =>
    fieldPermissions.find(
      (fieldPermission) => fieldPermission.fieldMetadataId === fieldMetadataId,
    );

  const isFieldAllowed = (fieldMetadataId: string) => {
    const fieldPermission = getFieldPermission(fieldMetadataId);

    // The server always lets the label identifier be read, whatever is stored for it
    if (
      mode === 'read' &&
      objectMetadataItem.labelIdentifierFieldMetadataId === fieldMetadataId
    ) {
      return true;
    }

    if (fieldPermission?.canReadFieldValue === false) {
      return false;
    }

    return mode === 'read' || fieldPermission?.canUpdateFieldValue !== false;
  };

  const getFieldLockedReason = (
    field: Pick<FieldMetadataItem, 'id' | 'isUIEditable'>,
  ) => {
    const fieldPermission = getFieldPermission(field.id);
    const hasStoredReadRestriction =
      fieldPermission?.canReadFieldValue === false;

    if (!(field.isUIEditable ?? true)) {
      // A restriction stored through the API still applies, so it must stay restorable
      if (mode === 'read') {
        return hasStoredReadRestriction ? undefined : t`Always visible`;
      }

      const hasOnlyStoredUpdateRestriction =
        !hasStoredReadRestriction &&
        fieldPermission?.canUpdateFieldValue === false;

      return hasOnlyStoredUpdateRestriction ? undefined : t`Can't be edited`;
    }

    if (
      mode === 'read' &&
      objectMetadataItem.labelIdentifierFieldMetadataId === field.id
    ) {
      return t`Always visible`;
    }

    if (mode === 'update' && hasStoredReadRestriction) {
      return t`Can't be seen`;
    }

    return undefined;
  };

  const isFieldLocked = (
    field: Pick<FieldMetadataItem, 'id' | 'isUIEditable'>,
  ) => isDefined(getFieldLockedReason(field));

  const allowedFieldIds = fieldMetadataItems
    .filter((field) => isFieldAllowed(field.id))
    .map((field) => field.id);

  const editableFieldMetadataItems = fieldMetadataItems.filter(
    (field) => !isFieldLocked(field),
  );

  const setFieldAllowed = ({
    fieldMetadataId,
    isAllowed,
  }: {
    fieldMetadataId: string;
    isAllowed: boolean;
  }) => {
    const fieldPermission: FieldPermission = getFieldPermission(
      fieldMetadataId,
    ) ?? {
      id: v4(),
      fieldMetadataId,
      objectMetadataId: objectMetadataItem.id,
      rowLevelPermissionPredicateGroupId: ruleRootGroupId ?? null,
      roleId,
    };

    if (mode === 'update') {
      upsertFieldPermissionInDraftRole({
        ...fieldPermission,
        canUpdateFieldValue: isAllowed ? null : false,
      });
      return;
    }

    if (isAllowed) {
      upsertFieldPermissionInDraftRole({
        ...fieldPermission,
        canReadFieldValue: null,
      });
      return;
    }

    upsertFieldPermissionInDraftRole({
      ...fieldPermission,
      canReadFieldValue: false,
      canUpdateFieldValue: false,
    });
  };

  const handleSelectedFieldIdsChange = (nextAllowedFieldIds: string[]) => {
    for (const field of editableFieldMetadataItems) {
      const isAllowed = nextAllowedFieldIds.includes(field.id);

      if (isAllowed !== allowedFieldIds.includes(field.id)) {
        setFieldAllowed({ fieldMetadataId: field.id, isAllowed });
      }
    }
  };

  const areAllFieldsAllowed =
    allowedFieldIds.length === fieldMetadataItems.length;

  const handleAllFieldsSelect = () => {
    const lockedAllowedFieldIds = allowedFieldIds.filter(
      (fieldId) =>
        !editableFieldMetadataItems.some((field) => field.id === fieldId),
    );

    handleSelectedFieldIdsChange(
      areAllFieldsAllowed
        ? lockedAllowedFieldIds
        : fieldMetadataItems.map((field) => field.id),
    );
  };

  const allowedFieldCount = allowedFieldIds.length;
  const fieldCount = fieldMetadataItems.length;
  const singleAllowedField =
    allowedFieldCount === 1
      ? fieldMetadataItems.find((field) => field.id === allowedFieldIds[0])
      : undefined;

  const getControlText = () => {
    if (areAllFieldsAllowed) {
      return t`All fields`;
    }

    if (allowedFieldCount === 0) {
      return t`No fields`;
    }

    if (isDefined(singleAllowedField)) {
      return singleAllowedField.label;
    }

    return t`${allowedFieldCount} of ${fieldCount} fields`;
  };

  const getControlIcon = () => {
    if (mode === 'read') {
      return allowedFieldCount === 0 ? IconEyeOff : IconEye;
    }

    return allowedFieldCount === 0 ? IconPencilOff : IconPencil;
  };

  const matchingFieldMetadataItems = fieldMetadataItems.filter((field) =>
    field.label.toLowerCase().includes(searchInputValue.toLowerCase()),
  );

  const selectControl = (
    <MultiSelectControl
      selectedOptions={[]}
      fixedIcon={getControlIcon()}
      fixedText={getControlText()}
      isDisabled={disabled}
      selectSizeVariant="small"
    />
  );

  if (disabled) {
    return selectControl;
  }

  return (
    <DropdownRoot
      dropdownId={`settings-role-object-fields-${mode}-${ruleRootGroupId ?? objectMetadataItem.id}`}
      type="picker"
      onOpenChange={(open) => {
        if (!open) {
          setSearchInputValue('');
        }
      }}
    >
      <Dropdown.Trigger render={<div />} nativeButton={false}>
        {selectControl}
      </Dropdown.Trigger>
      <DropdownContent
        width={GenericDropdownContentWidth.ExtraLarge}
        align="end"
        aria-label={mode === 'read' ? t`Fields to see` : t`Fields to edit`}
      >
        <Dropdown.Search
          value={searchInputValue}
          onValueChange={setSearchInputValue}
          placeholder={t`Search fields`}
          aria-label={t`Search fields`}
        />
        <Dropdown.Separator />
        <Dropdown.Section>
          <Dropdown.OptionItem
            indicator="checkbox"
            selected={areAllFieldsAllowed}
            description={t`${allowedFieldCount} of ${fieldCount}`}
            onSelect={handleAllFieldsSelect}
          >
            {t`All fields`}
          </Dropdown.OptionItem>
        </Dropdown.Section>
        <Dropdown.Separator />
        {isNonEmptyArray(matchingFieldMetadataItems) ? (
          <Dropdown.SelectionGroup
            aria-label={t`Fields`}
            multiple
            value={allowedFieldIds}
            onValueChange={handleSelectedFieldIdsChange}
          >
            <Dropdown.Section scrollable>
              {matchingFieldMetadataItems.map((field) => {
                const lockedReason = getFieldLockedReason(field);

                return (
                  <Dropdown.OptionItem
                    key={field.id}
                    value={field.id}
                    disabled={isDefined(lockedReason)}
                    description={lockedReason}
                    startIcon={<SelectOptionIcon Icon={getIcon(field.icon)} />}
                  >
                    {field.label}
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.Section>
          </Dropdown.SelectionGroup>
        ) : (
          <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
