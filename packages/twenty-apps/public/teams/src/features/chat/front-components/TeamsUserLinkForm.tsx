import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Section } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { PickedEntityButton } from 'src/features/chat/front-components/PickedEntityButton';
import { TeamsUserLinkFormField } from 'src/features/chat/front-components/TeamsUserLinkFormField';
import { TeamsUserLinkFormHint } from 'src/features/chat/front-components/TeamsUserLinkFormHint';
import { TeamsUserLinkTextInput } from 'src/features/chat/front-components/TeamsUserLinkTextInput';
import { TeamsUserPicker } from 'src/features/chat/front-components/TeamsUserPicker';
import { WorkspaceMemberPicker } from 'src/features/chat/front-components/WorkspaceMemberPicker';
import { type WorkspaceMemberOption } from 'src/features/chat/front-components/types/workspace-member-option.type';
import { useSetTeamsUserLink } from 'src/features/chat/front-components/hooks/use-set-teams-user-link';
import { type TeamsUserSearchOption } from 'src/features/chat/logic-functions/types/teams-user-search-option.type';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type TeamsUserLinkFormProps = {
  onLinkSaved: () => void;
};

export const TeamsUserLinkForm = ({ onLinkSaved }: TeamsUserLinkFormProps) => {
  const { t } = useTranslate();
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const [selectedUser, setSelectedUser] = useState<TeamsUserSearchOption | null>(
    null,
  );
  const [name, setName] = useState('');
  const [isPickerReopening, setIsPickerReopening] = useState(false);

  const { setTeamsUserLink, isSubmitting } = useSetTeamsUserLink();

  const canSubmit =
    isDefined(selectedMember) && isDefined(selectedUser) && !isSubmitting;

  const resetForm = () => {
    setSelectedMember(null);
    setSelectedUser(null);
    setName('');
    setIsPickerReopening(false);
  };

  const handleSubmit = async () => {
    if (!isDefined(selectedMember) || !isDefined(selectedUser)) {
      return;
    }

    const result = await setTeamsUserLink({
      workspaceMemberId: selectedMember.id,
      teamsUserAadObjectId: selectedUser.teamsUserAadObjectId,
      name: isNonEmptyString(name.trim())
        ? name.trim()
        : selectedUser.displayName,
    });

    enqueueSnackbar({
      message: isNonEmptyString(result.error) ? result.error : result.message,
      variant: result.success ? 'success' : 'error',
    });

    if (result.success) {
      resetForm();
      onLinkSaved();
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Link a Teams user')}
        description={t(
          "Pick a workspace member and the Teams account whose messages should act with that member's permissions. The link is set by you and active immediately.",
        )}
      />
      <StyledForm
        onSubmit={(event) => {
          event.preventDefault();

          if (canSubmit) {
            handleSubmit();
          }
        }}
      >
        <TeamsUserLinkFormField label={t('Workspace member')}>
          <WorkspaceMemberPicker
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            onClear={() => setSelectedMember(null)}
            disabled={isSubmitting}
          />
        </TeamsUserLinkFormField>
        <TeamsUserLinkFormField label={t('Teams user')}>
          {isDefined(selectedUser) ? (
            <PickedEntityButton
              name={selectedUser.displayName ?? selectedUser.teamsUserAadObjectId}
              meta={selectedUser.email}
              changeLabel={t('Change the Teams user')}
              onChangeRequest={() => {
                setIsPickerReopening(true);
                setName('');
                setSelectedUser(null);
              }}
              disabled={isSubmitting}
            />
          ) : (
            <TeamsUserPicker
              onSelect={setSelectedUser}
              disabled={isSubmitting}
              autoFocus={isPickerReopening}
            />
          )}
        </TeamsUserLinkFormField>
        <TeamsUserLinkFormField
          label={t('Display name (optional)')}
          htmlFor="teams-display-name"
        >
          <TeamsUserLinkTextInput
            id="teams-display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={selectedUser?.displayName ?? t('Ada Lovelace')}
            disabled={isSubmitting}
          />
        </TeamsUserLinkFormField>
        {isDefined(selectedUser) && (
          <TeamsUserLinkFormHint>
            {t('Saving sets a manual link that is active immediately.')}
          </TeamsUserLinkFormHint>
        )}
        <StyledActions>
          <Button
            type="button"
            variant="solid"
            color="accent"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isSubmitting ? t('Saving…') : t('Save link')}
          </Button>
        </StyledActions>
      </StyledForm>
    </Section.Root>
  );
};
