import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H2Title } from 'twenty-ui/typography';

import { SlackUserLinkConfirmCard } from 'src/front-components/components/SlackUserLinkConfirmCard';
import { SlackUserLinkTextInput } from 'src/front-components/components/SlackUserLinkTextInput';
import { WorkspaceMemberPicker } from 'src/front-components/components/WorkspaceMemberPicker';
import { useResolveSlackUser } from 'src/front-components/hooks/use-resolve-slack-user';
import { useSetSlackUserLink } from 'src/front-components/hooks/use-set-slack-user-link';
import { type SlackResolvedUser } from 'src/logic-functions/types/slack-resolved-user.type';
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
  gap: ${() => themeCssVariables.spacing[2]};
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
  const [resolvedUser, setResolvedUser] = useState<SlackResolvedUser | null>(
    null,
  );
  // Bumps whenever the Slack identity changes, so a resolve that is already in
  // flight against an earlier identity does not restore a stale match.
  const resolveRequestIdRef = useRef(0);

  const { resolveSlackUser, isResolving } = useResolveSlackUser();
  const { setSlackUserLink, isSubmitting } = useSetSlackUserLink();

  const hasSlackIdentity =
    isNonEmptyString(email.trim()) || isNonEmptyString(slackUserId.trim());

  const canResolve = hasSlackIdentity && !isResolving && !isSubmitting;
  const canSubmit =
    selectedMember !== null && resolvedUser !== null && !isSubmitting;

  const resetForm = () => {
    setSelectedMember(null);
    setEmail('');
    setName('');
    setSlackUserId('');
    setSlackTeamId('');
    setIsConnectUser(false);
    setResolvedUser(null);
  };

  // Any change to the Slack identity invalidates a previously confirmed match
  // and any resolve still in flight against the old identity.
  const clearResolvedUser = () => {
    resolveRequestIdRef.current += 1;

    if (resolvedUser !== null) {
      setResolvedUser(null);
    }
  };

  const handleResolve = async () => {
    const requestId = resolveRequestIdRef.current;

    const result = await resolveSlackUser({
      email: isNonEmptyString(email.trim()) ? email.trim() : undefined,
      slackUserId: isNonEmptyString(slackUserId.trim())
        ? slackUserId.trim()
        : undefined,
      slackTeamId: isNonEmptyString(slackTeamId.trim())
        ? slackTeamId.trim()
        : undefined,
    });

    // The identity changed while this request was in flight, so its result is
    // stale; a newer resolve owns the confirmed match now.
    if (requestId !== resolveRequestIdRef.current) {
      return;
    }

    if (!result.success) {
      setResolvedUser(null);
      enqueueSnackbar({ message: result.error, variant: 'error' });
      return;
    }

    setResolvedUser(result.slackUser);
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

  return (
    <Section>
      <H2Title
        title="Link a Slack user"
        description="Pick a workspace member and the Slack account whose messages should act with that member's permissions. In-workspace links ask the Slack user to approve first; manual links win over email matching."
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
            onChange={(event) => {
              setEmail(event.target.value);
              clearResolvedUser();
            }}
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
                onChange={(event) => {
                  setSlackUserId(event.target.value);
                  clearResolvedUser();
                }}
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
                onChange={(event) => {
                  setSlackTeamId(event.target.value);
                  clearResolvedUser();
                }}
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
        {resolvedUser !== null && (
          <SlackUserLinkConfirmCard resolvedUser={resolvedUser} />
        )}
        <StyledActions>
          {resolvedUser === null ? (
            <Button
              type="button"
              title={isResolving ? 'Finding…' : 'Find Slack user'}
              variant="secondary"
              disabled={!canResolve}
              onClick={handleResolve}
            />
          ) : (
            <Button
              type="button"
              title={isSubmitting ? 'Saving…' : 'Save link'}
              variant="primary"
              accent="blue"
              disabled={!canSubmit}
              onClick={handleSubmit}
            />
          )}
        </StyledActions>
      </StyledForm>
    </Section>
  );
};
