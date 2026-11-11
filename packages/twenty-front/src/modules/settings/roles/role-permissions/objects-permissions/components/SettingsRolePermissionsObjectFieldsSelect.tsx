import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
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
  disabled?: boolean;
};

export const SettingsRolePermissionsObjectFieldsSelect = ({
  roleId,
  objectMetadataItem,
  mode,
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
        fieldPermission.objectMetadataId === objectMetadataItem.id,
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

    if (fieldPermission?.canReadFieldValue === false) {
      return false;
    }

    return mode === 'read' || fieldPermission?.canUpdateFieldValue !== false;
  };

  const isFieldLocked = (
    fieldMetadataId: string,
    isUIEditable?: boolean | null,
  ) =>
    !(isUIEditable ?? true) ||
    (mode === 'read' &&
      objectMetadataItem.labelIdentifierFieldMetadataId === fieldMetadataId);

  const allowedFieldIds = fieldMetadataItems
    .filter((field) => isFieldAllowed(field.id))
    .map((field) => field.id);

  const editableFieldMetadataItems = fieldMetadataItems.filter(
    (field) => !isFieldLocked(field.id, field.isUIEditable),
  );

  const setFieldAllowed = (fieldMetadataId: string, isAllowed: boolean) => {
    const fieldPermission: FieldPermission = getFieldPermission(
      fieldMetadataId,
    ) ?? {
      id: v4(),
      fieldMetadataId,
      objectMetadataId: objectMetadataItem.id,
      roleId,
    };

    if (mode === 'read') {
      upsertFieldPermissionInDraftRole(
        isAllowed
          ? { ...fieldPermission, canReadFieldValue: null }
          : {
              ...fieldPermission,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
      );
      return;
    }

    upsertFieldPermissionInDraftRole(
      isAllowed
        ? {
            ...fieldPermission,
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          }
        : { ...fieldPermission, canUpdateFieldValue: false },
    );
  };

  const handleSelectedFieldIdsChange = (nextAllowedFieldIds: string[]) => {
    for (const field of editableFieldMetadataItems) {
      const isAllowed = nextAllowedFieldIds.includes(field.id);

      if (isAllowed !== allowedFieldIds.includes(field.id)) {
        setFieldAllowed(field.id, isAllowed);
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

  const controlText = areAllFieldsAllowed
    ? t`All fields`
    : allowedFieldCount === 0
      ? t`No fields`
      : isDefined(singleAllowedField)
        ? singleAllowedField.label
        : t`${allowedFieldCount} of ${fieldCount} fields`;

  const controlIcon =
    mode === 'read'
      ? allowedFieldCount === 0
        ? IconEyeOff
        : IconEye
      : allowedFieldCount === 0
        ? IconPencilOff
        : IconPencil;

  const matchingFieldMetadataItems = fieldMetadataItems.filter((field) =>
    field.label.toLowerCase().includes(searchInputValue.toLowerCase()),
  );

  const selectControl = (
    <MultiSelectControl
      selectedOptions={[]}
      fixedIcon={controlIcon}
      fixedText={controlText}
      isDisabled={disabled}
      selectSizeVariant="small"
    />
  );

  if (disabled) {
    return selectControl;
  }

  const lockedReason = mode === 'read' ? t`Always visible` : t`Can't be edited`;

  return (
    <DropdownRoot
      dropdownId={`settings-role-object-fields-${mode}-${objectMetadataItem.id}`}
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
                const isLocked = isFieldLocked(field.id, field.isUIEditable);

                return (
                  <Dropdown.OptionItem
                    key={field.id}
                    value={field.id}
                    disabled={isLocked}
                    description={isLocked ? lockedReason : undefined}
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
