import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useId } from 'react';
import {
  CoreObjectNameSingular,
  MessageChannelType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { InlineBanner } from 'twenty-ui/components/feedback';
import { IconAlertTriangle } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { CampaignEnvelopeBox } from '@/activities/emails/components/CampaignEnvelopeBox';
import { CampaignVariablePicker } from '@/activities/emails/components/CampaignVariablePicker';
import { useCampaignDetailsState } from '@/activities/emails/hooks/useCampaignDetailsState';
import { useUnsubscribeTopics } from '@/activities/emails/hooks/useUnsubscribeTopics';
import { type MessageCampaign } from '@/activities/emails/types/MessageCampaign';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { useMyMessageChannels } from '@/settings/accounts/hooks/useMyMessageChannels';
import { FormSingleRecordPicker } from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { Select } from '@/ui/input/components/Select';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';

const StyledWarningContainer = styled.div`
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const FROM_DROPDOWN_ID = 'campaign-composer-from-account';
const UNSUBSCRIBE_TOPIC_DROPDOWN_ID = 'campaign-composer-unsubscribe-topic';

type CampaignDetailsFieldsProps = {
  campaign: MessageCampaign;
};

export const CampaignDetailsFields = ({
  campaign,
}: CampaignDetailsFieldsProps) => {
  const detailsState = useCampaignDetailsState({ campaign });
  const instanceId = useId();
  const listDropdownId = `campaign-list-picker-${instanceId}`;
  const { openDropdown } = useOpenDropdown();

  const openDropdownById = (dropdownId: string) =>
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  const { channels } = useMyMessageChannels();
  const { unsubscribeTopics } = useUnsubscribeTopics();
  const { createOneRecord: createMessageList } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.MessageList,
  });

  const handleCreateList = async (searchInput?: string) => {
    const listName = searchInput?.trim() ?? '';
    const createdList = await createMessageList({
      name: listName.length > 0 ? listName : t`Untitled list`,
    });

    if (isDefined(createdList)) {
      detailsState.setListId(createdList.id);
    }
  };

  const senderOptions: SelectOption<string>[] = channels
    .filter((channel) => channel.type === MessageChannelType.EMAIL_GROUP)
    .map((channel) => channel.connectedAccount?.handle)
    .filter(isDefined)
    .map((handle) => ({ label: handle, value: handle }));

  const topicOptions: SelectOption<string>[] = unsubscribeTopics.map(
    (topic) => {
      const topicName = topic.name ?? t`Untitled topic`;

      return {
        label: topicName,
        value: topic.id,
        LeftComponent: (
          <Avatar
            colorSeed={topic.id}
            name={topicName}
            size="md"
            shape="circle"
          />
        ),
      };
    },
  );

  const hasTopicOptions = topicOptions.length > 0;
  const hasSenderOptions = senderOptions.length > 0;

  const isSenderSelectDisabled =
    senderOptions.length <= 1 &&
    senderOptions.some((option) => option.value === detailsState.fromAddress);
  const isTopicSelectDisabled =
    topicOptions.length <= 1 &&
    topicOptions.some(
      (option) => option.value === detailsState.unsubscribeTopicId,
    );

  return (
    <CampaignEnvelopeBox
      onBlur={() => detailsState.flush()}
      below={
        !hasSenderOptions && (
          <StyledWarningContainer>
            <InlineBanner
              embedded
              status="error"
              icon={<IconAlertTriangle aria-hidden="true" />}
            >{t`No sending address. Connect a verified domain in Settings.`}</InlineBanner>
          </StyledWarningContainer>
        )
      }
    >
      <ComposerFieldRow
        label={t`From`}
        onClick={
          isSenderSelectDisabled
            ? undefined
            : () => openDropdownById(FROM_DROPDOWN_ID)
        }
      >
        <Select
          dropdownId={FROM_DROPDOWN_ID}
          dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          fullWidth
          variant="transparent"
          value={detailsState.fromAddress}
          options={senderOptions}
          emptyOption={{ label: t`Select a sender`, value: '' }}
          onChange={detailsState.setFromAddress}
        />
      </ComposerFieldRow>
      <ComposerFieldRow
        label={t`To`}
        onClick={() => openDropdownById(listDropdownId)}
      >
        <FormSingleRecordPicker
          key={`list-${detailsState.draftResyncKey}`}
          dropdownId={listDropdownId}
          variant="transparent"
          objectNameSingulars={[CoreObjectNameSingular.MessageList]}
          defaultValue={detailsState.listId}
          onChange={detailsState.setListId}
          onCreate={handleCreateList}
        />
      </ComposerFieldRow>
      {hasTopicOptions && (
        <ComposerFieldRow
          label={t`Topic`}
          onClick={
            isTopicSelectDisabled
              ? undefined
              : () => openDropdownById(UNSUBSCRIBE_TOPIC_DROPDOWN_ID)
          }
        >
          <Select
            dropdownId={UNSUBSCRIBE_TOPIC_DROPDOWN_ID}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
            fullWidth
            variant="transparent"
            value={detailsState.unsubscribeTopicId ?? ''}
            options={topicOptions}
            showIconInControl={false}
            emptyOption={{
              label: t`No topic`,
              value: '',
            }}
            onChange={(value) =>
              detailsState.setUnsubscribeTopicId(value === '' ? null : value)
            }
          />
        </ComposerFieldRow>
      )}
      <ComposerFieldRow label={t`Subject`}>
        <FormTextFieldInput
          key={`subject-${detailsState.draftResyncKey}`}
          ariaLabel={t`Subject`}
          placeholder={t`Add a subject`}
          defaultValue={detailsState.subject}
          onChange={detailsState.setSubject}
          VariablePicker={CampaignVariablePicker}
          enableTemplateVariableFallback
        />
      </ComposerFieldRow>
    </CampaignEnvelopeBox>
  );
};
