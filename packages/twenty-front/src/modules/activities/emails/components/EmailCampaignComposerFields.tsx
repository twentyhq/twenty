import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { IconChevronDown, IconForbid } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type useEmailCampaignComposerState } from '@/activities/emails/hooks/useEmailCampaignComposerState';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { SingleRecordPicker } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPicker';
import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { Select } from '@/ui/input/components/Select';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const LIST_DROPDOWN_ID = 'email-campaign-list-picker';

type EmailListRecord = ObjectRecord & { name: string | null };

const StyledFieldsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSelectTrigger = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  height: 32px;
  justify-content: space-between;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledPlaceholder = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

type EmailCampaignComposerFieldsProps = {
  campaignState: ReturnType<typeof useEmailCampaignComposerState>;
};

export const EmailCampaignComposerFields = ({
  campaignState,
}: EmailCampaignComposerFieldsProps) => {
  const { closeDropdown } = useCloseDropdown();

  const { data: accountsData } = useQuery<{
    myConnectedAccounts: { id: string; handle: string }[];
  }>(GET_MY_CONNECTED_ACCOUNTS);

  const fromOptions: SelectOption<string>[] =
    accountsData?.myConnectedAccounts?.map((account) => ({
      label: account.handle,
      value: account.handle,
    })) ?? [];

  const { records: emailLists } = useFindManyRecords<EmailListRecord>({
    objectNameSingular: 'emailList',
  });

  const selectedList = emailLists.find(
    (list) => list.id === campaignState.emailListId,
  );

  const handleListSelected = (
    item: RecordPickerPickableMorphItem | null | undefined,
  ) => {
    campaignState.setEmailListId(item?.recordId ?? null);
    closeDropdown(LIST_DROPDOWN_ID);
  };

  return (
    <StyledFieldsContainer>
      <Select
        dropdownId="email-campaign-from"
        label={t`From`}
        fullWidth
        value={campaignState.fromAddress}
        options={fromOptions}
        emptyOption={{ label: t`Select a sender`, value: '' }}
        onChange={campaignState.setFromAddress}
      />
      <StyledLabel>{t`List`}</StyledLabel>
      <Dropdown
        dropdownId={LIST_DROPDOWN_ID}
        dropdownPlacement="bottom-start"
        clickableComponent={
          <StyledSelectTrigger type="button">
            {selectedList?.name ?? (
              <StyledPlaceholder>{t`Select a list`}</StyledPlaceholder>
            )}
            <IconChevronDown size={16} />
          </StyledSelectTrigger>
        }
        dropdownComponents={
          <SingleRecordPicker
            componentInstanceId={LIST_DROPDOWN_ID}
            focusId={LIST_DROPDOWN_ID}
            objectNameSingulars={['emailList']}
            onMorphItemSelected={handleListSelected}
            onCancel={() => closeDropdown(LIST_DROPDOWN_ID)}
            EmptyIcon={IconForbid}
            emptyLabel={t`No lists`}
            layoutDirection="search-bar-on-top"
          />
        }
      />
      <FormTextFieldInput
        label={t`Subject`}
        defaultValue=""
        onChange={campaignState.setSubject}
        placeholder={t`Subject`}
      />
      <FormAdvancedTextFieldInput
        defaultValue=""
        onChange={campaignState.setBody}
        placeholder={t`Type something or press "/" to see commands`}
        minHeight={120}
        maxWidth={600}
        contentType="html"
      />
    </StyledFieldsContainer>
  );
};
