import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';

// ENSO — read-only marketing-consent audit trail, surfaced on its own record-page
// tab (next to Timeline/Calendar). Every grant/revoke for the person, newest
// first, with who · how · why · when and a link to the triggering activity.
export const ENSO_PERSON_CONSENT_HISTORY_MARKER =
  '__enso_person_consent_history';

const SOURCE_LABELS: Record<string, string> = {
  FORM_WEBSITE: 'Website Form',
  LEAD_AD: 'Lead Ad',
  VERBAL: 'Verbal',
  DOUBLE_OPT_IN: 'Double opt-in',
  MIGRATION: 'Imported',
  WALK_IN: 'Walk-in',
  REFERRAL: 'Referral',
  MANUAL: 'Manual',
  IN_CHAT: 'Written (chat)',
  OTHER: 'Other',
};

const METHOD_LABELS: Record<string, string> = {
  UNSUBSCRIBE: 'Unsubscribe link',
  SMS_STOP: 'SMS STOP',
  WHATSAPP_OPTOUT: 'WhatsApp opt-out',
  MANUAL: 'Manual',
  VERBAL_REQUEST: 'Verbal/chat request',
  COMPLAINT: 'Complaint',
  LEGAL_ERASURE: 'Legal erasure (GDPR)',
  OTHER: 'Other',
};

const CHANNEL_LABELS: Record<string, string> = {
  EMAIL: 'Email',
  SMS: 'SMS',
  WHATSAPP: 'WhatsApp',
  CALL: 'Call',
};

const EVENT_GQL_FIELDS = {
  id: true,
  name: true,
  channel: true,
  action: true,
  source: true,
  method: true,
  note: true,
  occurredAt: true,
  inboundActivityId: true,
  createdBy: true,
};

const formatDateTime = (value: unknown): string => {
  if (typeof value !== 'string' || value === '') {
    return '';
  }
  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

const StyledContainer = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
  width: 100%;

  & * {
    box-sizing: border-box;
  }
`;

const StyledHint = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledItem = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledHead = styled.div`
  align-items: baseline;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

// $action: GRANTED (green) | REVOKED (danger).
const StyledAction = styled.span<{ $action: string }>`
  color: ${({ $action }) =>
    $action === 'GRANTED'
      ? themeCssVariables.color.green
      : themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.xs};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  text-transform: uppercase;
`;

const StyledChannel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMeta = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledNote = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
  font-style: italic;
`;

const StyledLink = styled.button`
  background: transparent;
  border: none;
  color: ${themeCssVariables.color.blue};
  cursor: pointer;
  font-size: ${themeCssVariables.font.size.xs};
  padding: 0;
  text-align: left;
  text-decoration: underline;
`;

export const PersonConsentHistory = () => {
  const { t } = useLingui();
  const { targetRecordIdentifier } = useLayoutRenderingContext();
  const personId = targetRecordIdentifier?.id;
  const isPerson =
    targetRecordIdentifier?.targetObjectNameSingular === 'person';

  const { records: events = [], loading } = useFindManyRecords({
    objectNameSingular: 'personProjectConsentEvent',
    filter: { personId: { eq: personId } },
    recordGqlFields: EVENT_GQL_FIELDS,
    skip: !isDefined(personId) || !isPerson,
    limit: 200,
  });

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  if (!isPerson || !isDefined(personId)) {
    return null;
  }

  if (loading) {
    return (
      <StyledContainer>
        <StyledHint>{t`Loading…`}</StyledHint>
      </StyledContainer>
    );
  }

  if (events.length === 0) {
    return (
      <StyledContainer>
        <StyledHint>{t`No consent changes recorded yet.`}</StyledHint>
      </StyledContainer>
    );
  }

  return (
    <StyledContainer>
      {[...events]
        .sort((first, second) =>
          String(second.occurredAt ?? '').localeCompare(
            String(first.occurredAt ?? ''),
          ),
        )
        .map((event) => {
          const action = (event.action as string) ?? '';
          const channelLabel =
            CHANNEL_LABELS[(event.channel as string) ?? ''] ??
            (event.channel as string) ??
            '';
          const projectLabel =
            ((event.name as string) ?? '').split(' · ')[1] ?? '';
          const how =
            action === 'REVOKED'
              ? (METHOD_LABELS[(event.method as string) ?? ''] ??
                (event.method as string))
              : (SOURCE_LABELS[(event.source as string) ?? ''] ??
                (event.source as string));
          const actor = (
            (event.createdBy as { name?: string } | null)?.name ?? ''
          ).trim();
          const note = (event.note as string) ?? '';
          const inboundActivityId = event.inboundActivityId as string | null;
          const metaParts = [
            how,
            actor,
            formatDateTime(event.occurredAt),
          ].filter((part) => isDefined(part) && part !== '');

          return (
            <StyledItem key={event.id as string}>
              <StyledHead>
                <StyledAction $action={action}>
                  {action === 'GRANTED' ? t`Granted` : t`Revoked`}
                </StyledAction>
                <StyledChannel>
                  {projectLabel
                    ? `${channelLabel} · ${projectLabel}`
                    : channelLabel}
                </StyledChannel>
              </StyledHead>
              {metaParts.length > 0 && (
                <StyledMeta>{metaParts.join(' · ')}</StyledMeta>
              )}
              {note !== '' && <StyledNote>“{note}”</StyledNote>}
              {isNonEmptyString(inboundActivityId) && (
                <StyledLink
                  onClick={() =>
                    openRecordInSidePanel({
                      recordId: inboundActivityId,
                      objectNameSingular: 'inboundActivity',
                    })
                  }
                >
                  {t`View triggering activity →`}
                </StyledLink>
              )}
            </StyledItem>
          );
        })}
    </StyledContainer>
  );
};
