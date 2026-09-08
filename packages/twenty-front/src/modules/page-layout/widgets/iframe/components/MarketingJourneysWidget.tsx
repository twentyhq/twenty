import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { getTokenPair } from '@/apollo/utils/getTokenPair';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

// ENSO — manager-facing marketing-journey view on a Person (or Opportunity, via
// its point of contact). One collapsible card per journey showing the full
// authored action sequence — each action iconed by type (journey/segment/
// audience enter-exit, email, sms) and coloured by state (done / current /
// upcoming) and, for messages, by live delivery status. Read-only.
export const ENSO_MARKETING_JOURNEYS_MARKER = '__enso_marketing_journeys';

type Delivery = {
  channel: string;
  status: string;
  sentAt: string | null;
  templateId: string | null;
  journeyId: string | null;
};

// Dittofeed email statuses → friendly label + state (good=engaged, ok=neutral,
// bad=problem).
const STATUS_META: Record<string, { label: string; state: string }> = {
  DFEmailDelivered: { label: 'Delivered', state: 'ok' },
  DFEmailOpened: { label: 'Opened', state: 'good' },
  DFEmailClicked: { label: 'Clicked', state: 'good' },
  DFEmailSent: { label: 'Sent', state: 'ok' },
  DFEmailBounced: { label: 'Bounced', state: 'bad' },
  DFEmailDropped: { label: 'Dropped', state: 'bad' },
  DFEmailMarkedSpam: { label: 'Marked spam', state: 'bad' },
};

// Action kinds — drive the icon + colour so lifecycle steps read differently
// from messages. Covers the full vocabulary: journey/segment/audience enter &
// exit, email, sms.
type StepKind =
  | 'journey-enter'
  | 'journey-complete'
  | 'journey-exit'
  | 'segment-enter'
  | 'segment-exit'
  | 'audience-enter'
  | 'audience-exit'
  | 'email'
  | 'sms';

const KIND_ICON: Record<StepKind, string> = {
  'journey-enter': 'IconRoute',
  'journey-complete': 'IconCircleCheck',
  'journey-exit': 'IconLogout',
  'segment-enter': 'IconUsersGroup',
  'segment-exit': 'IconUsersMinus',
  'audience-enter': 'IconTargetArrow',
  'audience-exit': 'IconTargetOff',
  email: 'IconMail',
  sms: 'IconMessage',
};

const isMessageKind = (kind: StepKind) => kind === 'email' || kind === 'sms';

type JourneyStep = { key: string; label: string; kind: StepKind };
const JOURNEY_DEFINITIONS: Record<
  string,
  { label: string; dittofeedJourneyId: string; steps: JourneyStep[] }
> = {
  ENSO_ESTATE_INTRO: {
    label: 'ENSO Estate · Intro',
    dittofeedJourneyId: 'c1e85ea4-5f4d-4b5b-aecd-ccd247cae95e',
    steps: [
      { key: 'entered', label: 'Entered journey', kind: 'journey-enter' },
      { key: 'email_1_sent', label: 'Welcome to ENSO', kind: 'email' },
      {
        key: 'email_2_sent',
        label: 'What makes an ENSO home different',
        kind: 'email',
      },
      {
        key: 'email_3_sent',
        label: 'Want to see it in person?',
        kind: 'email',
      },
      { key: 'finished', label: 'Completed', kind: 'journey-complete' },
    ],
  },
  // Demo journeys (different states) — showcase the icon vocabulary.
  ARTIMA_NURTURE: {
    label: 'ARTIMA · Nurture',
    dittofeedJourneyId: 'demo-artima-nurture',
    steps: [
      { key: 'entered', label: 'Entered journey', kind: 'journey-enter' },
      {
        key: 'segment_added',
        label: 'Added to "Warm leads" segment',
        kind: 'segment-enter',
      },
      { key: 'email_1_sent', label: 'ARTIMA welcome', kind: 'email' },
      { key: 'email_2_sent', label: 'Lifestyle brochure', kind: 'email' },
      {
        key: 'audience_added',
        label: 'Added to Meta retargeting',
        kind: 'audience-enter',
      },
      { key: 'email_3_sent', label: 'Book a private tour', kind: 'email' },
      { key: 'finished', label: 'Completed', kind: 'journey-complete' },
    ],
  },
  NEWTON_REENGAGE: {
    label: 'NEWTON · Re-engage',
    dittofeedJourneyId: 'demo-newton-reengage',
    steps: [
      { key: 'entered', label: 'Entered journey', kind: 'journey-enter' },
      { key: 'email_1_sent', label: 'We miss you', kind: 'email' },
      { key: 'sms_1_sent', label: 'SMS nudge', kind: 'sms' },
      {
        key: 'segment_removed',
        label: 'Removed from "Active" segment',
        kind: 'segment-exit',
      },
      { key: 'exited', label: 'Exited — replied', kind: 'journey-exit' },
    ],
  },
};

const ENROLLMENT_GQL_FIELDS = {
  id: true,
  journey: true,
  status: true,
  currentStep: true,
  enteredAt: true,
  lastEventAt: true,
};

const formatDate = (value: unknown): string => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
};

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 100%;
  overflow-x: hidden;
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  & * {
    box-sizing: border-box;
  }
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  overflow: hidden;
`;

const StyledCardHeader = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: none;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledHeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledChevron = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledJourneyName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledBadge = styled.span<{ $state: string }>`
  color: ${({ $state }) =>
    $state === 'finished'
      ? themeCssVariables.color.green
      : $state === 'exited'
        ? themeCssVariables.font.color.tertiary
        : themeCssVariables.color.blue};
  flex: 0 0 auto;
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSteps = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledStepRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[1]} 0;
`;

const StyledStepLeft = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledIconWrap = styled.span`
  align-items: center;
  display: flex;
  flex: 0 0 auto;
`;

const StyledStepLabel = styled.span<{ $upcoming: boolean }>`
  color: ${({ $upcoming }) =>
    $upcoming
      ? themeCssVariables.font.color.tertiary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledStepMeta = styled.span<{ $state: string }>`
  color: ${({ $state }) =>
    $state === 'good'
      ? themeCssVariables.color.green
      : $state === 'bad'
        ? themeCssVariables.font.color.danger
        : $state === 'next'
          ? themeCssVariables.color.blue
          : $state === 'upcoming'
            ? themeCssVariables.font.color.tertiary
            : themeCssVariables.font.color.secondary};
  flex: 0 0 auto;
  font-size: ${themeCssVariables.font.size.xs};
`;

const statusBadgeState = (status: unknown): string =>
  status === 'FINISHED'
    ? 'finished'
    : status === 'EXITED'
      ? 'exited'
      : 'active';

// Icon colour: upcoming muted; current blue; done → green for healthy messages,
// danger for bounced, muted for "exit" actions, and accent colours that set
// lifecycle/segment/audience apart from the green message steps.
const iconColor = (
  kind: StepKind,
  stepState: string,
  deliveryState: string | null,
): string => {
  if (stepState === 'upcoming') return themeCssVariables.font.color.tertiary;
  if (stepState === 'next') return themeCssVariables.color.blue;

  if (isMessageKind(kind)) {
    return deliveryState === 'bad'
      ? themeCssVariables.font.color.danger
      : themeCssVariables.color.green;
  }
  if (kind.endsWith('-exit')) return themeCssVariables.font.color.tertiary;
  if (kind === 'segment-enter') return themeCssVariables.color.purple;
  if (kind === 'audience-enter') return themeCssVariables.color.orange;
  return themeCssVariables.color.blue; // journey-enter / journey-complete
};

export const MarketingJourneysWidget = () => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  const recordId = targetRecordIdentifier?.id;
  const objectName = targetRecordIdentifier?.targetObjectNameSingular;
  const isPerson = objectName === 'person';
  const isOpportunity = objectName === 'opportunity';

  const { records: opportunities = [] } = useFindManyRecords({
    objectNameSingular: 'opportunity',
    filter: { id: { eq: recordId } },
    recordGqlFields: { id: true, pointOfContactId: true },
    skip: !isOpportunity || !isDefined(recordId),
    limit: 1,
  });

  const personId = isPerson
    ? recordId
    : (opportunities[0]?.pointOfContactId as string | undefined);

  const { records: enrollments = [], loading } = useFindManyRecords({
    objectNameSingular: 'marketingEnrollment',
    filter: { personId: { eq: personId } },
    recordGqlFields: ENROLLMENT_GQL_FIELDS,
    skip: !isDefined(personId),
    limit: 20,
  });

  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isDefined(personId)) {
      return;
    }

    let cancelled = false;
    const token = getTokenPair()?.accessOrWorkspaceAgnosticToken?.token;
    const headers: Record<string, string> = isDefined(token)
      ? { Authorization: `Bearer ${token}` }
      : {};

    fetch(
      `${REST_API_BASE_URL}/enso/marketing/deliveries?personId=${personId}`,
      {
        headers,
      },
    )
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { deliveries?: Delivery[] } | null) => {
        if (!cancelled && isDefined(data)) {
          setDeliveries(data.deliveries ?? []);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [personId]);

  useEffect(() => {
    setCollapsed(
      new Set(
        enrollments
          .filter((e) => e.status === 'FINISHED' || e.status === 'EXITED')
          .map((e) => e.id as string),
      ),
    );
  }, [enrollments]);

  if (!isPerson && !isOpportunity) {
    return null;
  }

  if (!isDefined(personId)) {
    return (
      <StyledContainer>
        <StyledHint>{t`No contact linked to show marketing activity for.`}</StyledHint>
      </StyledContainer>
    );
  }

  const toggle = (id: string) =>
    setCollapsed((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  if (loading) {
    return (
      <StyledContainer>
        <StyledHint>{t`Loading…`}</StyledHint>
      </StyledContainer>
    );
  }

  if (enrollments.length === 0) {
    return (
      <StyledContainer>
        <StyledHint>{t`Not in any marketing journey yet.`}</StyledHint>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {enrollments.map((enrollment) => {
        const id = enrollment.id as string;
        const journeyKey = enrollment.journey as string;
        const definition = JOURNEY_DEFINITIONS[journeyKey];
        const status = enrollment.status as string;
        const isOpen = !collapsed.has(id);

        const journeyDeliveries = deliveries
          .filter(
            (delivery) =>
              !isDefined(definition?.dittofeedJourneyId) ||
              delivery.journeyId === definition?.dittofeedJourneyId,
          )
          .slice()
          .sort((a, b) => (a.sentAt ?? '').localeCompare(b.sentAt ?? ''));

        const steps: JourneyStep[] = definition?.steps ?? [
          {
            key: (enrollment.currentStep as string) ?? 'current',
            label: t`Current step`,
            kind: 'journey-enter',
          },
        ];
        const currentIndex = steps.findIndex(
          (step) => step.key === enrollment.currentStep,
        );
        const isFinished = status === 'FINISHED';
        const isExited = status === 'EXITED';

        let messageCursor = 0;

        return (
          <StyledCard key={id}>
            <StyledCardHeader onClick={() => toggle(id)}>
              <StyledHeaderLeft>
                <StyledChevron>{isOpen ? '▾' : '▸'}</StyledChevron>
                <StyledJourneyName>
                  {definition?.label ?? journeyKey}
                </StyledJourneyName>
              </StyledHeaderLeft>
              <StyledBadge $state={statusBadgeState(status)}>
                {status}
              </StyledBadge>
            </StyledCardHeader>

            {isOpen && (
              <StyledSteps>
                {steps.map((step, index) => {
                  // currentStep = the last action that HAPPENED, so it (and
                  // everything before) is Done; the very next step is "Next",
                  // the rest "Upcoming". A finished journey is all Done; an
                  // exited one shows nothing after the exit as Next.
                  const stepState =
                    isFinished || index <= currentIndex
                      ? 'done'
                      : !isExited && index === currentIndex + 1
                        ? 'next'
                        : 'upcoming';
                  const isUpcoming = stepState === 'upcoming';

                  const delivery = isMessageKind(step.kind)
                    ? journeyDeliveries[messageCursor++]
                    : undefined;
                  const deliveryMeta = isDefined(delivery)
                    ? (STATUS_META[delivery.status] ?? {
                        label: delivery.status,
                        state: 'ok',
                      })
                    : null;

                  let meta = { text: '', state: 'ok' };
                  if (stepState === 'upcoming') {
                    meta = { text: t`Upcoming`, state: 'upcoming' };
                  } else if (stepState === 'next') {
                    meta = { text: t`Next`, state: 'next' };
                  } else if (isDefined(deliveryMeta)) {
                    const date = formatDate(delivery?.sentAt);
                    meta = {
                      text:
                        date !== ''
                          ? `${deliveryMeta.label} · ${date}`
                          : deliveryMeta.label,
                      state: deliveryMeta.state,
                    };
                  } else {
                    meta = { text: t`Done`, state: 'ok' };
                  }

                  const StepIcon = getIcon(KIND_ICON[step.kind]);
                  const color = iconColor(
                    step.kind,
                    stepState,
                    deliveryMeta?.state ?? null,
                  );

                  return (
                    <StyledStepRow key={step.key}>
                      <StyledStepLeft>
                        <StyledIconWrap>
                          <StepIcon size={16} color={color} stroke={2} />
                        </StyledIconWrap>
                        <StyledStepLabel $upcoming={isUpcoming}>
                          {step.label}
                        </StyledStepLabel>
                      </StyledStepLeft>
                      <StyledStepMeta $state={meta.state}>
                        {meta.text}
                      </StyledStepMeta>
                    </StyledStepRow>
                  );
                })}
              </StyledSteps>
            )}
          </StyledCard>
        );
      })}
    </StyledContainer>
  );
};
