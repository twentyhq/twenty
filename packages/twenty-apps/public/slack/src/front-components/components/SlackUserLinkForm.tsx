import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { ResolvedSlackUserField } from 'src/front-components/components/ResolvedSlackUserField';
import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';
import { SlackUserPicker } from 'src/front-components/components/SlackUserPicker';
import { WorkspaceMemberPicker } from 'src/front-components/components/WorkspaceMemberPicker';
import { useAutoResolveSlackUser } from 'src/front-components/hooks/use-auto-resolve-slack-user';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';
import { buildSlackUserLinkSaveNote } from 'src/front-components/utils/build-slack-user-link-save-note.util';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[4]};
`;

const StyledField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[1]};
`;

const StyledLabel = styled.label`
  color: ${() => themeCssVariables.font.color.secondary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledHint = styled.span`
  color: ${() => themeCssVariables.font.color.tertiary};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledResolveError = styled.span`
  color: ${() => themeCssVariables.color.red};
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledDisclosureButton = styled.button`
  align-self: flex-start;
  background: transparent;
  border: none;
  color: ${() => themeCssVariables.color.blue};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  padding: 0;
`;

const StyledActions = styled.div`
  display: flex;
  gap: ${() => themeCssVariables.spacing[2]};
`;

type SlackUserLinkFormProps = {
  onLinkSaved: () => void;
};

export const SlackUserLinkForm = ({ onLinkSaved }: SlackUserLinkFormProps) => {
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const [name, setName] = useState('');
  const [slackUserId, setSlackUserId] = useState('');
  const [slackTeamId, setSlackTeamId] = useState('');
  const [isConnectUser, setIsConnectUser] = useState(false);
  // True after the picked Slack user is clicked open, so the returning search
  // input takes focus; never on first render.
  const [isSlackSearchReopening, setIsSlackSearchReopening] = useState(false);

  const {
    resolvedUser,
    resolveError,
    isResolving,
    onIdentityChange,
    resolveNow,
    selectResolvedUser,
    clearResolution,
  } = useAutoResolveSlackUser();
  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

  const canSubmit =
    selectedMember !== null && resolvedUser !== null && !isSubmitting;

  const resetForm = () => {
    setSelectedMember(null);
    setName('');
    setSlackUserId('');
    setSlackTeamId('');
    setIsConnectUser(false);
    setIsSlackSearchReopening(false);
    clearResolution();
  };

  const handleSubmit = async () => {
    if (selectedMember === null || resolvedUser === null) {
      return;
    }

    const result = await setSlackUserLink({
      workspaceMemberId: selectedMember.id,
      slackUserId: resolvedUser.slackUserId,
      slackTeamId: isNonEmptyString(resolvedUser.slackTeamId)
        ? resolvedUser.slackTeamId
        : undefined,
      name: isNonEmptyString(name.trim())
        ? name.trim()
        : resolvedUser.displayName,
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

  const handleFormSubmit = () => {
    if (resolvedUser === null) {
      resolveNow({ email: '', slackUserId, slackTeamId });
      return;
    }

    if (canSubmit) {
      handleSubmit();
    }
  };

  return (
    <Section>
      <H2Title
        title="Link a Slack user"
        description="Pick a workspace member and the Slack account whose messages should act with that member's permissions. A link whose Slack email matches the member activates immediately; other in-workspace links ask the Slack user to approve first."
      />
      <StyledForm
        onSubmit={(event) => {
          event.preventDefault();
          handleFormSubmit();
        }}
      >
        <StyledField>
          <StyledLabel>Workspace member</StyledLabel>
          <WorkspaceMemberPicker
            selectedMember={selectedMember}
            onSelect={setSelectedMember}
            onClear={() => setSelectedMember(null)}
            disabled={isSubmitting}
          />
        </StyledField>
        {resolvedUser !== null ? (
          <StyledField>
            <StyledLabel>Slack user</StyledLabel>
            <ResolvedSlackUserField
              resolvedUser={resolvedUser}
              onChangeRequest={() => {
                setIsSlackSearchReopening(true);
                clearResolution();
              }}
              disabled={isSubmitting}
            />
          </StyledField>
        ) : (
          <>
            <StyledField>
              <StyledLabel>Slack user</StyledLabel>
              <SlackUserPicker
                onSelect={selectResolvedUser}
                disabled={isSubmitting}
                autoFocus={isSlackSearchReopening}
              />
            </StyledField>
            {isConnectUser ? (
              <>
                <StyledField>
                  <StyledLabel htmlFor="slack-user-id">
                    Slack user ID
                  </StyledLabel>
                  <SlackUserLinkTextInput
                    id="slack-user-id"
                    value={slackUserId}
                    onChange={(event) => {
                      setSlackUserId(event.target.value);
                      onIdentityChange({
                        email: '',
                        slackUserId: event.target.value,
                        slackTeamId,
                      });
                    }}
                    placeholder="U0123456789"
                    disabled={isSubmitting}
                  />
                  <StyledHint>
                    Use this for a Slack Connect user from another workspace,
                    who will not appear in the search above.
                  </StyledHint>
                </StyledField>
                <StyledField>
                  <StyledLabel htmlFor="slack-team-id">
                    Slack team ID (optional)
                  </StyledLabel>
                  <SlackUserLinkTextInput
                    id="slack-team-id"
                    value={slackTeamId}
                    onChange={(event) => {
                      setSlackTeamId(event.target.value);
                      onIdentityChange({
                        email: '',
                        slackUserId,
                        slackTeamId: event.target.value,
                      });
                    }}
                    placeholder="T0123456789"
                    disabled={isSubmitting}
                  />
                  <StyledHint>
                    Defaults to the installed Slack workspace. Set it for a
                    Slack Connect user, using the team ID their messages carry.
                  </StyledHint>
                </StyledField>
              </>
            ) : (
              <StyledDisclosureButton
                type="button"
                onClick={() => setIsConnectUser(true)}
              >
                Guest or Slack Connect user? Link by Slack ID instead
              </StyledDisclosureButton>
            )}
            {isResolving ? (
              <StyledHint>Finding the Slack user…</StyledHint>
            ) : resolveError !== null ? (
              <StyledResolveError>{resolveError}</StyledResolveError>
            ) : null}
          </>
        )}
        <StyledField>
          <StyledLabel htmlFor="slack-display-name">
            Display name (optional)
          </StyledLabel>
          <SlackUserLinkTextInput
            id="slack-display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={resolvedUser?.displayName ?? 'Ada Lovelace'}
            disabled={isSubmitting}
          />
        </StyledField>
        {resolvedUser !== null && (
          <StyledHint>
            {buildSlackUserLinkSaveNote({ resolvedUser, selectedMember })}
          </StyledHint>
        )}
        <StyledActions>
          <Button
            type="button"
            title={isSubmitting ? 'Saving…' : 'Save link'}
            variant="primary"
            accent="blue"
            disabled={!canSubmit}
            onClick={handleSubmit}
          />
        </StyledActions>
      </StyledForm>
    </Section>
  );
};
