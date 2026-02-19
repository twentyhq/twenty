import { useLingui } from '@lingui/react/macro';
import { useFormContext } from 'react-hook-form';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink } from 'twenty-ui/display';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { Select } from '@/ui/input/components/Select';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { RelationType } from '~/generated-metadata/graphql';
import { type SettingsDataModelFieldEditFormValues } from '~/pages/settings/data-model/SettingsObjectFieldEdit';

type SettingsDataModelFieldRelationJunctionFormProps = {
  objectNameSingular: string;
};

export const SettingsDataModelFieldRelationJunctionForm = ({
  objectNameSingular,
}: SettingsDataModelFieldRelationJunctionFormProps) => {
  const { t } = useLingui();
  const { watch, setValue } =
    useFormContext<SettingsDataModelFieldEditFormValues>();

  const isAdvancedModeEnabled = useRecoilValueV2(isAdvancedModeEnabledState);

  const { objectMetadataItem: sourceObjectMetadataItem } =
    useObjectMetadataItem({ objectNameSingular });

  const { objectMetadataItems } = useObjectMetadataItems();

  const relationType = watch('relationType') ?? RelationType.ONE_TO_MANY;
  const targetObjectIds = watch('morphRelationObjectMetadataIds') ?? [];
  const currentSettings = watch('settings');
  const junctionTargetFieldId = currentSettings?.junctionTargetFieldId;

  // Only applies to ONE_TO_MANY with single target
  if (
    !isAdvancedModeEnabled ||
    relationType !== RelationType.ONE_TO_MANY ||
    targetObjectIds.length !== 1
  ) {
    return null;
  }

  const junctionObjectMetadataItem = objectMetadataItems.find(
    (item) => item.id === targetObjectIds[0],
  );

  if (!junctionObjectMetadataItem) {
    return null;
  }

  const sourceObjectMetadataId = sourceObjectMetadataItem?.id;

  // Self-referential relations cannot be junction objects
  if (sourceObjectMetadataId === junctionObjectMetadataItem.id) {
    return null;
  }

  // Build options from junction object fields
  const junctionFieldOptions: { label: string; value: string }[] = [];

  // Add MORPH_RELATION fields (use first field of each morphId group)
  // morphRelations already contains all targets, so any sibling works
  const morphIdsSeen = new Set<string>();
  junctionObjectMetadataItem.fields
    .filter(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        isDefined(field.morphId),
    )
    .forEach((field) => {
      if (!morphIdsSeen.has(field.morphId!)) {
        morphIdsSeen.add(field.morphId!);
        junctionFieldOptions.push({
          label: `${field.label} (polymorphic)`,
          value: field.id,
        });
      }
    });

  // Add regular MANY_TO_ONE relations (not pointing back to source)
  junctionObjectMetadataItem.fields
    .filter((field) => {
      if (
        field.type !== FieldMetadataType.RELATION ||
        field.relation?.type !== RelationType.MANY_TO_ONE
      ) {
        return false;
      }
      return (
        !isDefined(sourceObjectMetadataId) ||
        field.relation?.targetObjectMetadata.id !== sourceObjectMetadataId
      );
    })
    .forEach((field) => {
      junctionFieldOptions.push({
        label: field.label,
        value: field.id,
      });
    });

  if (junctionFieldOptions.length === 0) {
    return null;
  }

  const isJunctionConfigEnabled = isDefined(junctionTargetFieldId);

  const handleJunctionToggle = (checked: boolean) => {
    if (checked && junctionFieldOptions.length > 0) {
      setValue(
        'settings',
        {
          ...currentSettings,
          junctionTargetFieldId: junctionFieldOptions[0].value,
        },
        {
          shouldDirty: true,
        },
      );
    } else {
      setValue(
        'settings',
        {
          ...currentSettings,
          junctionTargetFieldId: undefined,
        },
        {
          shouldDirty: true,
        },
      );
    }
  };

  const handleSelectionChange = (selectedValue: string) => {
    setValue(
      'settings',
      {
        ...currentSettings,
        junctionTargetFieldId: selectedValue,
      },
      {
        shouldDirty: true,
      },
    );
  };

  return (
    <>
      <SettingsOptionCardContentToggle
        Icon={IconLink}
        title={t`This is a relation to a Junction Object`}
        description={t`Build many-to-many relations`}
        checked={isJunctionConfigEnabled}
        onChange={handleJunctionToggle}
        divider={isJunctionConfigEnabled}
        advancedMode
      />

      {isJunctionConfigEnabled && (
        <SettingsOptionCardContentSelect
          title={t`Target relation on Junction Object`}
          description={t`Skip the junction object (similar to many-to-many relations)`}
        >
          <Select
            dropdownId="junction-target-field-select"
            selectSizeVariant="small"
            dropdownWidth={120}
            value={junctionTargetFieldId}
            options={junctionFieldOptions}
            onChange={handleSelectionChange}
          />
        </SettingsOptionCardContentSelect>
      )}
    </>
  );
};
