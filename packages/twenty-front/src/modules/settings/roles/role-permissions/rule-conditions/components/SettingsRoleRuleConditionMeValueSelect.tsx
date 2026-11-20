/* @license Enterprise */

import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconUserCircle } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Field } from 'twenty-ui/primitives/input';
import {
  StandardObjectNameSingular,
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import {
  getFieldOrSubFieldType,
  getRlsPredicateCompatibleWorkspaceMemberFieldTypes,
  isDefined,
  isNonEmptyArray,
} from 'twenty-shared/utils';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { getCompositeSubFieldLabel } from '@/object-record/object-filter-dropdown/utils/getCompositeSubFieldLabel';
import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RLSDynamicValue } from '@/object-record/record-filter/types/RecordFilter';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { RULE_CONDITION_FIELD_TYPES } from '@/settings/roles/role-permissions/rule-conditions/constants/RuleConditionFieldTypes';
import { getComparableWorkspaceMemberRelationFields } from '@/settings/roles/role-permissions/rule-conditions/utils/getComparableWorkspaceMemberRelationFields';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useLingui } from '@lingui/react/macro';

type MeValueMenuItem = {
  id: string;
  label: string;
  icon: string | null;
  fieldMetadataId: string;
  subFieldName: string | null;
};

type SettingsRoleRuleConditionMeValueSelectProps = {
  onSelect: (selection: RLSDynamicValue) => void;
  recordFilterId: string;
};

export const SettingsRoleRuleConditionMeValueSelect = ({
  onSelect,
  recordFilterId,
}: SettingsRoleRuleConditionMeValueSelectProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [searchInput, setSearchInput] = useState('');

  const { objectMetadataItem: workspaceMemberMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: StandardObjectNameSingular.WorkspaceMember,
    });

  const selectedFieldMetadataItem = useAtomComponentSelectorValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  const currentRecordFilters = useAtomComponentStateValue(
    currentRecordFiltersComponentState,
  );

  const recordFilter = currentRecordFilters.find(
    (filter) => filter.id === recordFilterId,
  );

  const selectedFieldType = selectedFieldMetadataItem?.type;
  const selectedSubFieldName = recordFilter?.subFieldName;

  const targetFieldType = isDefined(selectedFieldType)
    ? getFieldOrSubFieldType({
        fieldType: selectedFieldType,
        subFieldName: selectedSubFieldName,
      })
    : null;

  const compatibleWorkspaceMemberFieldTypes = isDefined(selectedFieldType)
    ? getRlsPredicateCompatibleWorkspaceMemberFieldTypes({
        fieldType: selectedFieldType,
        subFieldName: selectedSubFieldName,
      })
    : undefined;

  const isRelationToWorkspaceMember =
    selectedFieldMetadataItem?.type === FieldMetadataType.RELATION &&
    selectedFieldMetadataItem.relation?.targetObjectMetadata.nameSingular ===
      StandardObjectNameSingular.WorkspaceMember;

  const getCompatibleWorkspaceMemberFields = () => {
    if (!isDefined(workspaceMemberMetadataItem)) {
      return [];
    }

    if (selectedFieldMetadataItem?.type === FieldMetadataType.RELATION) {
      return getComparableWorkspaceMemberRelationFields({
        workspaceMemberFieldMetadataItems: workspaceMemberMetadataItem.fields,
        targetObjectMetadataId:
          selectedFieldMetadataItem.relation?.targetObjectMetadata.id,
      });
    }

    return workspaceMemberMetadataItem.fields.filter((field) => {
      if (
        field.name === 'createdAt' ||
        field.name === 'updatedAt' ||
        field.name === 'deletedAt' ||
        field.name === 'id'
      ) {
        return false;
      }

      if (
        !isDefined(targetFieldType) ||
        !isDefined(compatibleWorkspaceMemberFieldTypes)
      ) {
        return true;
      }

      if (!RULE_CONDITION_FIELD_TYPES.includes(targetFieldType)) {
        return false;
      }

      if (compatibleWorkspaceMemberFieldTypes.includes(field.type)) {
        return true;
      }

      if (!isCompositeFieldType(field.type)) {
        return false;
      }

      return (
        compositeTypeDefinitions
          .get(field.type)
          ?.properties.some((property) =>
            compatibleWorkspaceMemberFieldTypes.includes(property.type),
          ) ?? false
      );
    });
  };

  const compatibleWorkspaceMemberFields = getCompatibleWorkspaceMemberFields();

  const getFieldMenuItems = (
    field: (typeof compatibleWorkspaceMemberFields)[number],
  ): MeValueMenuItem[] => {
    const fieldType = field.type;

    if (!isCompositeFieldType(fieldType)) {
      return [
        {
          id: field.id,
          label: field.label,
          icon: field.icon ?? null,
          fieldMetadataId: field.id,
          subFieldName: null,
        },
      ];
    }

    const compositeType = compositeTypeDefinitions.get(fieldType);

    return (SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS[fieldType]?.subFields ?? [])
      .filter(
        (subField) =>
          subField.isFilterable &&
          compositeType?.properties.find(
            (property) => property.name === subField.subFieldName,
          )?.type !== FieldMetadataType.RAW_JSON,
      )
      .filter(
        (subField) =>
          !isDefined(compatibleWorkspaceMemberFieldTypes) ||
          compatibleWorkspaceMemberFieldTypes.includes(
            getFieldOrSubFieldType({
              fieldType,
              subFieldName: subField.subFieldName,
            }),
          ),
      )
      .map((subField) => ({
        id: `${field.id}-${subField.subFieldName}`,
        label: `${field.label} / ${getCompositeSubFieldLabel(
          fieldType,
          subField.subFieldName,
        )}`,
        icon: field.icon ?? null,
        fieldMetadataId: field.id,
        subFieldName: subField.subFieldName,
      }));
  };

  const idField = workspaceMemberMetadataItem?.fields.find(
    (field) => field.name === 'id',
  );

  const getMeIdMenuItems = (): MeValueMenuItem[] => {
    if (!isDefined(idField) || !isRelationToWorkspaceMember) {
      return [];
    }

    return [
      {
        id: 'me-id',
        label: t`Me (User ID)`,
        icon: null,
        fieldMetadataId: idField.id,
        subFieldName: null,
      },
    ];
  };

  const menuItems = [
    ...getMeIdMenuItems(),
    ...compatibleWorkspaceMemberFields.flatMap(getFieldMenuItems),
  ];

  const filteredMenuItems = !searchInput
    ? menuItems
    : menuItems.filter((item) =>
        item.label.toLowerCase().includes(searchInput.toLowerCase()),
      );

  const fieldTypeLabel = targetFieldType
    ? getFieldMetadataTypeLabel(targetFieldType)
    : '';

  const fieldTypeLabelLowercase = fieldTypeLabel?.toLowerCase() ?? '';

  const headerText = fieldTypeLabel
    ? t`Select 1 ${fieldTypeLabelLowercase} field`
    : t`Select 1 field`;

  const placeholderText = fieldTypeLabel
    ? t`Search 1 ${fieldTypeLabelLowercase} field`
    : t`Search 1 field`;

  return (
    <>
      <Dropdown.Header>
        <Dropdown.Title>{headerText}</Dropdown.Title>
        <Dropdown.Close aria-label={t`Close`} />
      </Dropdown.Header>
      <Field.Root>
        <Dropdown.Search
          value={searchInput}
          placeholder={placeholderText}
          aria-label={placeholderText}
          onValueChange={setSearchInput}
        />
      </Field.Root>
      <Dropdown.Section>
        {filteredMenuItems.map((item) => (
          <Dropdown.OptionItem
            key={item.id}
            startIcon={
              <SelectOptionIcon
                Icon={
                  isNonEmptyString(item.icon)
                    ? getIcon(item.icon)
                    : IconUserCircle
                }
              />
            }
            onSelect={() =>
              onSelect({
                workspaceMemberFieldMetadataId: item.fieldMetadataId,
                workspaceMemberSubFieldName: item.subFieldName,
              })
            }
          >
            {item.label}
          </Dropdown.OptionItem>
        ))}
        {!isNonEmptyArray(filteredMenuItems) && (
          <Dropdown.Empty>{t`No compatible fields`}</Dropdown.Empty>
        )}
      </Dropdown.Section>
    </>
  );
};
