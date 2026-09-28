import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components';
import { IconPencil, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadObjectNameSingular';
import { useChatThreadRecordAttachmentActions } from '@/ai/hooks/useChatThreadRecordAttachmentActions';
import { agentChatThreadPermissionsFamilySelector } from '@/ai/states/selectors/agentChatThreadPermissionsFamilySelector';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { generateJunctionRelationGqlFields } from '@/object-record/graphql/record-gql-fields/utils/generateJunctionRelationGqlFields';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { getJunctionRelationPickerData } from '@/object-record/record-field/ui/utils/junction/getJunctionRelationPickerData';
import { type ObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { type ValidJunctionConfig } from '@/object-record/record-field/ui/utils/junction/types/ValidJunctionConfig';
import { MultipleRecordPicker } from '@/object-record/record-picker/multiple-record-picker/components/MultipleRecordPicker';
import { useMultipleRecordPickerOpen } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerOpen';
import { useMultipleRecordPickerPerformSearch } from '@/object-record/record-picker/multiple-record-picker/hooks/useMultipleRecordPickerPerformSearch';
import { multipleRecordPickerPickableMorphItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerPickableMorphItemsComponentState';
import { multipleRecordPickerSearchFilterComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchFilterComponentState';
import { multipleRecordPickerSearchableObjectMetadataItemsComponentState } from '@/object-record/record-picker/multiple-record-picker/states/multipleRecordPickerSearchableObjectMetadataItemsComponentState';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

type AiChatThreadRecordTargetsContentProps = {
  threadId: string;
  instanceId: string;
  junctionConfig: ObjectMorphJunctionConfig & ValidJunctionConfig;
};

export const AiChatThreadRecordTargetsContent = ({
  threadId,
  instanceId,
  junctionConfig,
}: AiChatThreadRecordTargetsContentProps) => {
  const { t } = useLingui();
  const { objectMetadataItems } = useObjectMetadataItems();
  const junctionFieldName = junctionConfig.junctionField.name;

  const recordGqlFields = useMemo(
    () => ({
      id: true,
      workflowRunId: true,
      [junctionFieldName]: generateJunctionRelationGqlFields({
        junctionConfig,
        objectMetadataItems,
      }),
    }),
    [junctionConfig, junctionFieldName, objectMetadataItems],
  );

  const { record: thread } = useFindOneRecord({
    objectNameSingular: AGENT_CHAT_THREAD_OBJECT_NAME_SINGULAR,
    objectRecordId: threadId,
    recordGqlFields,
  });

  const permissions = useAtomFamilySelectorValue(
    agentChatThreadPermissionsFamilySelector,
    threadId,
  );
  const { attachChatThreadToRecord, detachChatThreadFromRecord } =
    useChatThreadRecordAttachmentActions();

  const dropdownId = `${instanceId}-${threadId}`;
  const { closeDropdown } = useCloseDropdown();
  const { openMultipleRecordPicker } = useMultipleRecordPickerOpen();
  const { performSearch } = useMultipleRecordPickerPerformSearch();
  const setMultipleRecordPickerSearchFilter = useSetAtomComponentState(
    multipleRecordPickerSearchFilterComponentState,
    dropdownId,
  );
  const setMultipleRecordPickerPickableMorphItems = useSetAtomComponentState(
    multipleRecordPickerPickableMorphItemsComponentState,
    dropdownId,
  );
  const setMultipleRecordPickerSearchableObjectMetadataItems =
    useSetAtomComponentState(
      multipleRecordPickerSearchableObjectMetadataItemsComponentState,
      dropdownId,
    );

  if (!isDefined(thread)) {
    return null;
  }

  const junctionRecords = thread[junctionFieldName] as
    | ObjectRecord[]
    | undefined;

  const targetRecords = extractTargetRecordsFromJunction({
    junctionRecords,
    targetFields: junctionConfig.targetFields,
    objectMetadataItems,
    includeRecord: true,
  }).flatMap(({ record, objectMetadataId }) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ id }) => id === objectMetadataId,
    );

    return isDefined(record) && isDefined(objectMetadataItem)
      ? [{ record, objectNameSingular: objectMetadataItem.nameSingular }]
      : [];
  });

  // A workflow run's conversation belongs to the run, and the server refuses
  // to file it under anything else.
  const canEditRecordTargets =
    permissions?.canUpdate === true && !isDefined(thread.workflowRunId);

  if (targetRecords.length === 0 && !canEditRecordTargets) {
    return null;
  }

  const handleOpen = () => {
    const { pickableMorphItems, searchableObjectMetadataItems } =
      getJunctionRelationPickerData({
        junctionRecords,
        targetFields: junctionConfig.targetFields,
        objectMetadataItems,
      });

    setMultipleRecordPickerSearchableObjectMetadataItems(
      searchableObjectMetadataItems,
    );
    setMultipleRecordPickerSearchFilter('');
    setMultipleRecordPickerPickableMorphItems(pickableMorphItems);
    openMultipleRecordPicker(dropdownId);
    performSearch({
      multipleRecordPickerInstanceId: dropdownId,
      forceSearchFilter: '',
      forceSearchableObjectMetadataItems: searchableObjectMetadataItems,
      forcePickableMorphItems: pickableMorphItems,
    });
  };

  const handleChange = (morphItem: RecordPickerPickableMorphItem) => {
    const objectMetadataItem = objectMetadataItems.find(
      ({ id }) => id === morphItem.objectMetadataId,
    );

    if (!isDefined(objectMetadataItem)) {
      return;
    }

    const attachment = {
      threadId,
      objectNameSingular: objectMetadataItem.nameSingular,
      recordId: morphItem.recordId,
    };

    void (morphItem.isSelected
      ? attachChatThreadToRecord(attachment)
      : detachChatThreadFromRecord(attachment));
  };

  const hasTargetRecords = targetRecords.length > 0;
  const triggerLabel = hasTargetRecords
    ? t`Edit linked records`
    : t`Link to a record`;
  const TriggerIcon = hasTargetRecords ? IconPencil : IconPlus;

  return (
    <StyledContainer>
      {targetRecords.map(({ record, objectNameSingular }) => (
        <RecordChip
          key={record.id}
          objectNameSingular={objectNameSingular}
          record={record}
        />
      ))}
      {canEditRecordTargets && (
        <Dropdown
          dropdownId={dropdownId}
          dropdownPlacement="bottom-end"
          onOpen={handleOpen}
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
