import { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/primitives/input';
import { IconX } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/components/feedback';
import { GetInviteSuggestionsDocument } from '~/generated-metadata/graphql';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { useGettingStarted } from '@/getting-started/hooks/useGettingStarted';
import {
  StyledGettingStartedColumn,
  StyledGettingStartedRow,
  StyledGettingStartedInput,
  StyledGettingStartedMuted,
} from '@/getting-started/components/GettingStartedStyles';

export const GettingStartedInviteAction = () => {
  const { t } = useLingui();
  const { data } = useQuery(GetInviteSuggestionsDocument);
  const [emails, setEmails] = useState<string[] | null>(null);
  const [saving, setSaving] = useState(false);
  const values = emails ?? [
    ...(data?.getInviteSuggestions.map((suggestion) => suggestion.email) ?? []),
    '',
  ];
  const { sendInvitation } = useCreateWorkspaceInvitation();
  const { completeStep } = useGettingStarted();
  const { enqueueToast } = useToast();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const addresses = [
      ...new Set(
        values.map((value) => value.trim().toLowerCase()).filter(Boolean),
      ),
    ];
    if (!addresses.length || saving) return;
    setSaving(true);
    try {
      const result = await sendInvitation({ emails: addresses });
      const invitations = result.data?.sendInvitations;
      if (invitations?.result.length) {
        const sent = new Set(
          invitations.result.map((invitation) =>
            invitation.email.toLowerCase(),
          ),
        );
        setEmails([...addresses.filter((email) => !sent.has(email)), '']);
        await completeStep('inviteTeam');
      }
      if (invitations?.errors.length)
        enqueueToast({
          status: 'error',
          children: invitations.errors.join(', '),
        });
      if (result.error) throw result.error;
    } catch {
      enqueueToast({
        status: 'error',
        children: t`Could not send invitations. Please try again.`,
      });
    } finally {
      setSaving(false);
    }
  };
  return (
    <form onSubmit={(event) => void submit(event)}>
      <StyledGettingStartedColumn>
        {(data?.getInviteSuggestions.length ?? 0) > 0 && (
          <StyledGettingStartedMuted>{t`Found in your emails`}</StyledGettingStartedMuted>
        )}
        {values.map((email, index) => (
          <StyledGettingStartedRow key={index}>
            <StyledGettingStartedInput
              type="email"
              value={email}
              aria-label={t`Teammate email ${index + 1}`}
              placeholder={t`Email address`}
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                if (next[next.length - 1]) next.push('');
                setEmails(next);
              }}
            />
            {email && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={t`Remove email`}
                onClick={() =>
                  setEmails(values.filter((_, position) => position !== index))
                }
              >
                <IconX size={14} />
              </Button>
            )}
          </StyledGettingStartedRow>
        ))}
        <StyledGettingStartedRow>
          <Button
            type="submit"
            size="sm"
            variant="solid"
            color="accent"
            loading={saving}
            disabled={!values.some((email) => email.trim())}
          >{t`Invite`}</Button>
        </StyledGettingStartedRow>
      </StyledGettingStartedColumn>
    </form>
  );
};
