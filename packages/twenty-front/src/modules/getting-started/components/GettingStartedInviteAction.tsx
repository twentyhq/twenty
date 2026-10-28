import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { getValidInviteEmails } from '@/onboarding/utils/getValidInviteEmails';
import { TextInput } from '@/ui/input/components/TextInput';
import { useCreateWorkspaceInvitation } from '@/workspace-invitation/hooks/useCreateWorkspaceInvitation';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent, useState } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { GetInviteSuggestionsDocument } from '~/generated-metadata/graphql';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledFooter = styled.div`
  display: flex;
`;

export const GettingStartedInviteAction = () => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { refetch } = useGettingStartedProgress();
  const { sendInvitation } = useCreateWorkspaceInvitation();
  const { data } = useQuery(GetInviteSuggestionsDocument, {
    fetchPolicy: 'cache-first',
  });
  const [draftEmails, setDraftEmails] = useState<string[] | null>(null);
  const [isSending, setIsSending] = useState(false);

  const inviteSuggestions = data?.getInviteSuggestions ?? [];
  const emails = draftEmails ?? [
    ...inviteSuggestions.map((suggestion) => suggestion.email),
    '',
  ];
  const validEmails = getValidInviteEmails(emails);

  const isInvalidEmail = (email: string) =>
    isNonEmptyString(email) && !isNonEmptyArray(getValidInviteEmails([email]));

  const hasInvalidEmail = emails.some(isInvalidEmail);

  const updateEmail = ({ index, email }: { index: number; email: string }) => {
    const nextEmails = emails.map((currentEmail, emailIndex) =>
      emailIndex === index ? email : currentEmail,
    );

    setDraftEmails(nextEmails.at(-1) === '' ? nextEmails : [...nextEmails, '']);
  };

  const removeEmail = (index: number) =>
    setDraftEmails(emails.filter((_, emailIndex) => emailIndex !== index));

  const sendInvitations = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSending(true);

    try {
      const { data: sendInvitationsData } = await sendInvitation({
        emails: validEmails,
        isOnboardingInvitation: true,
      });

      if (!isDefined(sendInvitationsData)) {
        return;
      }

      const { result: invitations, errors } =
        sendInvitationsData.sendInvitations;

      if (isNonEmptyArray(errors)) {
        enqueueToast({ status: 'error', children: errors.join(', ') });
      }

      if (invitations.length === 0) {
        return;
      }

      const invitedEmails = invitations.map((invitation) =>
        invitation.email.toLowerCase(),
      );

      setDraftEmails([
        ...validEmails.filter((email) => !invitedEmails.includes(email)),
        '',
      ]);
      enqueueToast({
        status: 'success',
        children: t`Invite link sent to email addresses`,
      });
      void refetch();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <StyledForm onSubmit={(event) => void sendInvitations(event)}>
      {inviteSuggestions.length > 0 && (
        <Text size="sm" color="tertiary">{t`Found in your emails`}</Text>
      )}
      {emails.map((email, index) => {
        const emailNumber = index + 1;

        return (
          <TextInput
            key={index}
            type="email"
            value={email}
            error={isInvalidEmail(email) ? t`Invalid email` : undefined}
            noErrorHelper
            aria-label={t`Teammate email ${emailNumber}`}
            placeholder={t`Email address`}
            onChange={(text) => updateEmail({ index, email: text })}
            RightIcon={isNonEmptyString(email) ? IconX : undefined}
            onRightIconClick={
              isNonEmptyString(email) ? () => removeEmail(index) : undefined
            }
            fullWidth
          />
        );
      })}
      <StyledFooter>
        <Button
          type="submit"
          size="sm"
          variant="solid"
          color="accent"
          loading={isSending}
          disabled={validEmails.length === 0 || hasInvalidEmail}
        >{t`Invite`}</Button>
      </StyledFooter>
    </StyledForm>
  );
};
