import { allowRequestsToTwentyIconsState } from '@/client-config/states/allowRequestsToTwentyIcons';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useIsRecordFieldReadOnly } from '@/object-record/read-only/hooks/useIsRecordFieldReadOnly';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useRecordShowContainerActions } from '@/object-record/record-show/hooks/useRecordShowContainerActions';
import { useRecordShowPage } from '@/object-record/record-show/hooks/useRecordShowPage';
import { recordStoreFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreFamilySelectorV2';
import { recordStoreIdentifierFamilySelectorV2 } from '@/object-record/record-store/states/selectors/recordStoreIdentifierFamilySelectorV2';
import { RecordTitleCell } from '@/object-record/record-title-cell/components/RecordTitleCell';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentValueV2';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilySelectorValueV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { Avatar } from 'twenty-ui/display';
import {
  FeatureFlagKey,
  FieldMetadataType,
} from '~/generated-metadata/graphql';
import { dateLocaleStateV2 } from '~/localization/states/dateLocaleStateV2';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';
import { CommandMenuPageInfoLayout } from './CommandMenuPageInfoLayout';

export const CommandMenuRecordInfo = ({
  commandMenuPageInstanceId,
}: {
  commandMenuPageInstanceId: string;
}) => {
  const viewableRecordNameSingular = useRecoilComponentValueV2(
    viewableRecordNameSingularComponentState,
    commandMenuPageInstanceId,
  );
  const allowRequestsToTwentyIcons = useRecoilValueV2(
    allowRequestsToTwentyIconsState,
  );

  const viewableRecordId = useRecoilComponentValueV2(
    viewableRecordIdComponentState,
    commandMenuPageInstanceId,
  );

  const { objectNameSingular, objectRecordId } = useRecordShowPage(
    viewableRecordNameSingular!,
    viewableRecordId!,
  );

  const recordCreatedAt = useFamilySelectorValueV2(
    recordStoreFamilySelectorV2,
    { recordId: objectRecordId, fieldName: 'createdAt' },
  ) as string | null;

  const isFilesFieldMigrated = useIsFeatureEnabled(
    FeatureFlagKey.IS_FILES_FIELD_MIGRATED,
  );

  const recordIdentifier = useFamilySelectorValueV2(
    recordStoreIdentifierFamilySelectorV2,
    {
      recordId: objectRecordId,
      allowRequestsToTwentyIcons,
      isFilesFieldMigrated,
    },
  );

  const { localeCatalog } = useRecoilValueV2(dateLocaleStateV2);
  const beautifiedCreatedAt = isNonEmptyString(recordCreatedAt)
    ? beautifyPastDateRelativeToNow(recordCreatedAt, localeCatalog)
    : '';

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular,
    });

  const isTitleReadOnly = useIsRecordFieldReadOnly({
    recordId: objectRecordId,
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    objectMetadataId: objectMetadataItem.id,
  });

  const { useUpdateOneObjectRecordMutation } = useRecordShowContainerActions({
    objectNameSingular,
  });

  const fieldDefinition = {
    type: labelIdentifierFieldMetadataItem?.type ?? FieldMetadataType.TEXT,
    iconName: '',
    fieldMetadataId: labelIdentifierFieldMetadataItem?.id ?? '',
    label: labelIdentifierFieldMetadataItem?.label ?? '',
    metadata: {
      fieldName: labelIdentifierFieldMetadataItem?.name ?? '',
      objectMetadataNameSingular: objectNameSingular,
    },
    defaultValue: labelIdentifierFieldMetadataItem?.defaultValue,
  };

  return (
    <CommandMenuPageInfoLayout
      icon={
        recordIdentifier ? (
          <Avatar
            avatarUrl={recordIdentifier.avatarUrl}
            placeholder={recordIdentifier.name}
            placeholderColorSeed={objectRecordId}
            size="md"
            type={recordIdentifier.avatarType}
          />
        ) : undefined
      }
      title={
        <FieldContext.Provider
          value={{
            recordId: objectRecordId,
            isLabelIdentifier: false,
            fieldDefinition,
            useUpdateRecord: useUpdateOneObjectRecordMutation,
            isCentered: false,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: isTitleReadOnly,
          }}
        >
          <RecordTitleCell
            sizeVariant="sm"
            containerType={RecordTitleCellContainerType.PageHeader}
          />
        </FieldContext.Provider>
      }
      label={
        beautifiedCreatedAt ? (
          <Trans>Created {beautifiedCreatedAt}</Trans>
        ) : undefined
      }
    />
  );
};
