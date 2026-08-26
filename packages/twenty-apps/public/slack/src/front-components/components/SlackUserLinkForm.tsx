import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';
import { WorkspaceMemberPicker } from 'src/front-components/components/WorkspaceMemberPicker';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type WorkspaceMemberOption } from 'src/front-components/types/workspace-member-option.type';

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
`;

type SlackUserLinkFormProps = {
  onLinkSaved: () => void;
};

export const SlackUserLinkForm = ({ onLinkSaved }: SlackUserLinkFormProps) => {
  const [selectedMember, setSelectedMember] =
    useState<WorkspaceMemberOption | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [slackUserId, setSlackUserId] = useState('');
  const [slackTeamId, setSlackTeamId] = useState('');
  const [isConnectUser, setIsConnectUser] = useState(false);

  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

  const hasSlackIdentity =
    isNonEmptyString(email.trim()) || isNonEmptyString(slackUserId.trim());

  const canSubmit =
    selectedMember !== null && hasSlackIdentity && !isSubmitting;

  const resetForm = () => {
    setSelectedMember(null);
    setEmail('');
    setName('');
    setSlackUserId('');
    setSlackTeamId('');
    setIsConnectUser(false);
  };

  const handleSubmit = async () => {
    if (selectedMember === null || !hasSlackIdentity) {
      return;
    }

    const result = await setSlackUserLink({
      workspaceMemberId: selectedMember.id,
      email: isNonEmptyString(email.trim()) ? email.trim() : undefined,
      slackUserId: isNonEmptyString(slackUserId.trim())
        ? slackUserId.trim()
        : undefined,
      slackTeamId: isNonEmptyString(slackTeamId.trim())
        ? slackTeamId.trim()
        : undefined,
      name: isNonEmptyString(name.trim()) ? name.trim() : undefined,
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
    <Section>
      <H2Title
        title="Link a Slack user"
        description="Pick a workspace member and the Slack account whose messages should act with that member's permissions. Manual links win over email matching."
      />
      <StyledForm
        onSubmit={(event) => {
          event.preventDefault();
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
        <StyledField>
          <StyledLabel htmlFor="slack-email">Slack email</StyledLabel>
          <SlackUserLinkTextInput
            id="slack-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="ada@company.com"
            disabled={isSubmitting}
          />
          <StyledHint>
            The email on their Slack account. We match it to a Slack user in
            your workspace.
          </StyledHint>
        </StyledField>
        <StyledField>
          <StyledLabel htmlFor="slack-display-name">
            Display name (optional)
          </StyledLabel>
          <SlackUserLinkTextInput
            id="slack-display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ada Lovelace"
            disabled={isSubmitting}
          />
        </StyledField>
        {isConnectUser ? (
          <>
            <StyledField>
              <StyledLabel htmlFor="slack-user-id">Slack user ID</StyledLabel>
              <SlackUserLinkTextInput
                id="slack-user-id"
                value={slackUserId}
                onChange={(event) => setSlackUserId(event.target.value)}
                placeholder="U0123456789"
                disabled={isSubmitting}
              />
              <StyledHint>
                Use this for guests or Slack Connect users whose email is not in
                your workspace. Takes precedence over the email above.
              </StyledHint>
            </StyledField>
            <StyledField>
              <StyledLabel htmlFor="slack-team-id">
                Slack team ID (optional)
              </StyledLabel>
              <SlackUserLinkTextInput
                id="slack-team-id"
                value={slackTeamId}
                onChange={(event) => setSlackTeamId(event.target.value)}
                placeholder="T0123456789"
                disabled={isSubmitting}
              />
              <StyledHint>
                Defaults to the installed Slack workspace. Set it for a Slack
                Connect user, using the team ID their messages carry.
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
