import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { StyledGettingStartedBookCallBody } from '@/getting-started/components/StyledGettingStartedBookCallBody';
import { StyledGettingStartedBookCallFooter } from '@/getting-started/components/StyledGettingStartedBookCallFooter';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { type CalEventTypeReference } from '@/getting-started/types/CalEventTypeReference';
import { type CalSlot } from '@/getting-started/types/CalSlot';
import { createCalBooking } from '@/getting-started/utils/createCalBooking';
import { type TimeFormat } from '@/localization/constants/TimeFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatIanaTimeZoneLabel } from '@/getting-started/utils/formatIanaTimeZoneLabel';
import { getAttendeeName } from '@/onboarding/utils/getAttendeeName';
import { TextInput } from '@/ui/input/components/TextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { formatInTimeZone } from 'date-fns-tz';
import { type FormEvent, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { IconCalendarEvent } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { GettingStartedStepActionKey } from '~/generated-metadata/graphql';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
`;

const StyledPanel = styled(StyledGettingStartedBookCallBody)`
  display: flex;
  flex-direction: column;
`;

const StyledSummary = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledSummaryText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSlotLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledTimeZoneLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

type GettingStartedBookCallConfirmFormProps = {
  eventTypeReference: CalEventTypeReference;
  slot: CalSlot;
  timeZone: string;
  timeFormat: TimeFormat;
  onBack: () => void;
  onBooked: () => void;
};

export const GettingStartedBookCallConfirmForm = ({
  eventTypeReference,
  slot,
  timeZone,
  timeFormat,
  onBack,
  onBooked,
}: GettingStartedBookCallConfirmFormProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { enqueueToast } = useToast();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { updateGettingStarted } = useUpdateGettingStarted();
  const [name, setName] = useState(() =>
    isDefined(currentWorkspaceMember?.name)
      ? getAttendeeName(currentWorkspaceMember.name)
      : getAttendeeName(currentUser),
  );
  const [email, setEmail] = useState(currentUser?.email ?? '');
  const [title, setTitle] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  const formatInUserTimeZone = (date: string, dateFormat: string) =>
    formatInTimeZone(new Date(date), timeZone, dateFormat, {
      locale: localeCatalog,
    });

  const slotLabel = `${formatInUserTimeZone(slot.start, 'EEEE, MMMM d')} · ${formatInUserTimeZone(slot.start, timeFormat)} – ${formatInUserTimeZone(slot.end, timeFormat)}`;
  const canRequestCall = [name, email, title].every((value) =>
    isNonEmptyString(value.trim()),
  );

  const requestCall = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsBooking(true);

    try {
      await createCalBooking({
        eventTypeReference,
        start: slot.start,
        attendee: {
          name: name.trim(),
          email: email.trim(),
          timeZone,
        },
        title: title.trim(),
      });
      await updateGettingStarted({
        completedStepActionKey: GettingStartedStepActionKey.BOOK_CALL,
      });
      onBooked();
    } catch {
      enqueueToast({
        status: 'error',
        children: t`We couldn't book this time. Pick another one or try again.`,
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <StyledForm onSubmit={(event) => void requestCall(event)}>
      <StyledPanel>
        <StyledSummary>
          <IconCalendarEvent size={theme.icon.size.md} aria-hidden />
          <StyledSummaryText>
            <StyledSlotLabel>{slotLabel}</StyledSlotLabel>
            <StyledTimeZoneLabel>
              {formatIanaTimeZoneLabel({
                timeZone,
                referenceDate: new Date(slot.start),
              })}
            </StyledTimeZoneLabel>
          </StyledSummaryText>
        </StyledSummary>
        <StyledFields>
          <TextInput
            label={t`Your name`}
            value={name}
            onChange={setName}
            disabled={isBooking}
            fullWidth
          />
          <TextInput
            type="email"
            label={t`Email address`}
            value={email}
            onChange={setEmail}
            disabled={isBooking}
            fullWidth
          />
          <TextInput
            label={t`What is this meeting about?`}
            required
            placeholder={t`What you'd like to set up in Twenty`}
            value={title}
            onChange={setTitle}
            disabled={isBooking}
            fullWidth
          />
        </StyledFields>
        <StyledGettingStartedBookCallFooter>
          <Button
            size="sm"
            variant="outline"
            disabled={isBooking}
            onClick={onBack}
          >{t`Back`}</Button>
          <Button
            size="sm"
            type="submit"
            variant="solid"
            color="accent"
            loading={isBooking}
            disabled={!canRequestCall}
          >{t`Request call`}</Button>
        </StyledGettingStartedBookCallFooter>
      </StyledPanel>
    </StyledForm>
  );
};
