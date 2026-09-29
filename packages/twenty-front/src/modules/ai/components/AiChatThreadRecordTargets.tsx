import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconPencil, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useDetachChatThreadFromRecord } from '@/ai/hooks/useDetachChatThreadFromRecord';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useObjectMorphJunctionConfig } from '@/object-record/record-field/ui/hooks/useObjectMorphJunctionConfig';
import { useOpenJunctionRelationPicker } from '@/object-record/record-field/ui/hooks/useOpenJunctionRelationPicker';
import { findTargetFieldInfo } from '@/object-record/record-field/ui/utils/junction/findTargetFieldInfo';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useFieldWidgetJunctionRelationRecords } from '@/page-layout/widgets/field/hooks/useFieldWidgetJunctionRelationRecords';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
`;

// Lets the list shrink in a narrow header, where it folds the chips that no
// longer fit into a count.
const StyledRecordChips = styled.div`
  min-width: 0;
`;

type AiChatThreadRecordTargetsProps = {
  threadId: string;
  instanceId: string;
};

export const AiChatThreadRecordTargets = ({
  threadId,
  instanceId,
}: AiChatThreadRecordTargetsProps) => {
  const { t } = useLingui();
  const isConversationsTabEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
  );
  const { objectMetadataItems } = useObjectMetadataItems();
  const objectMorphJunctionConfig = useObjectMorphJunctionConfig({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
  });
  const junctionConfig = isUsableJunctionConfig(objectMorphJunctionConfig)
    ? objectMorphJunctionConfig
    : null;

  const recordGqlFields = useMemo(
    () => ({
      id: true,
      workflowRunId: true,
      ...(isDefined(junctionConfig)
        ? {
            [junctionConfig.junctionField.name]:
              generateJunctionRelationGqlFields({
                junctionConfig,
                objectMetadataItems,
              }),
          }
        : {}),
    }),
    [junctionConfig, objectMetadataItems],
  );

  const { record: thread } = useFindOneRecord({
    objectNameSingular: CoreObjectNameSingular.AgentChatThread,
    objectRecordId: threadId,
    recordGqlFields,
    skip: !isConversationsTabEnabled || !isDefined(junctionConfig),
  });

  const junctionRecords: ObjectRecord[] | undefined = isDefined(junctionConfig)
    ? thread?.[junctionConfig.junctionField.name]
    : undefined;

  const targetRecords = useFieldWidgetJunctionRelationRecords({
    relationValue: junctionRecords,
    junctionConfig: { targetFields: junctionConfig?.targetFields ?? [] },
  });

  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { detachChatThreadFromRecord } = useDetachChatThreadFromRecord();

  const dropdownId = `${instanceId}-${threadId}`;
  const { closeDropdown } = useCloseDropdown();
  const { openJunctionRelationPicker } = useOpenJunctionRelationPicker();
  const setMultipleRecordPickerSearchFilter = useSetAtomComponentState(
    multipleRecordPickerSearchFilterComponentState,
    dropdownId,
  );

  if (
    !isConversationsTabEnabled ||
    !isDefined(junctionConfig) ||
    !isDefined(thread)
  ) {
    return null;
  }

  // A workflow run's conversation is the record of what its agent step did,
  // so it is not filed under anything else.
  const canEditRecordTargets =
    (permissions?.canUpdate ?? false) && !isDefined(thread.workflowRunId);

  const hasTargetRecords = targetRecords.length > 0;

  if (!hasTargetRecords && !canEditRecordTargets) {
    return null;
  }

  const handleChange = (morphItem: RecordPickerPickableMorphItem) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ id }) => id === morphItem.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    if (morphItem.isSelected) {
      void attachChatThreadToRecord({
        threadId,
        objectNameSingular: objectMetadataItem.nameSingular,
        recordId: morphItem.recordId,
      });

      return;
    }

    const targetFieldInfo = findTargetFieldInfo(
      junctionConfig.targetFields,
      morphItem.objectMetadataId,
      objectMetadataItems,
    );
    const targetJoinColumnName = targetFieldInfo?.joinColumnName;

    if (!isDefined(targetFieldInfo) || !isDefined(targetJoinColumnName)) {
      return;
    }

    const linkIdsToRecord = (junctionRecords ?? [])
      .filter(
        (junctionRecord) =>
          getRelatedRecordIdFromJunction({
            junctionRecord,
            relationFieldName: targetFieldInfo.fieldName,
            joinColumnName: targetJoinColumnName,
          }) === morphItem.recordId,
      )
      .map(({ id }) => id);

    void detachChatThreadFromRecord(linkIdsToRecord);
  };

  const triggerLabel = hasTargetRecords
    ? t`Edit linked records`
    : t`Link to a record`;
  const TriggerIcon = hasTargetRecords ? IconPencil : IconPlus;

  return (
    <StyledContainer>
      {hasTargetRecords && (
        <StyledRecordChips>
          <ExpandableList isChipCountDisplayed>
            {targetRecords.map(({ record, objectNameSingular }) => (
              <RecordChip
                key={`${objectNameSingular}-${record.id}`}
                objectNameSingular={objectNameSingular}
                record={record}
              />
            ))}
          </ExpandableList>
        </StyledRecordChips>
      )}
      {canEditRecordTargets && (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-end"
          onOpen={() =>
            openJunctionRelationPicker({
              recordPickerInstanceId: dropdownId,
              junctionRecords,
              targetFields: junctionConfig.targetFields,
            })
          }
          onClose={() => setMultipleRecordPickerSearchFilter('')}
          clickableComponent={
            <LightIconButton
              aria-label={triggerLabel}
              title={triggerLabel}
              emphasis="subtle"
              size="sm"
            >
              <TriggerIcon />
            </LightIconButton>
          }
          dropdownComponents={
            <MultipleRecordPicker
              focusId={dropdownId}
              componentInstanceId={dropdownId}
              onChange={handleChange}
              onSubmit={() => closeDropdown(dropdownId)}
              onClickOutside={() => closeDropdown(dropdownId)}
              layoutDirection="search-bar-on-top"
            />
          }
        />
      )}
    </StyledContainer>
  );
};
