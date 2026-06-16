import {
  Alert,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Loader,
  Popover,
  SegmentedControl,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconCheck,
  IconDeviceFloppy,
  IconMail,
  IconPlus,
  IconSparkles,
  IconTestPipe,
  IconUsers,
} from 'twenty-ui/display';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  BUILDER_MERGE_FIELDS,
  dubaiLocalToIso,
  envelopeMessage,
  LISTING_MERGE_FIELDS,
  listingPreviewSamples,
  PREVIEW_SAMPLES,
  type FormatAction,
} from '@/propel/lib/campaignBuilderConfig';
import {
  type MergeField,
  type MergeValues,
  parseTemplate,
} from '@/propel/lib/campaignRenderer';
import { ComposeToolbar } from '@/propel/components/campaign/ComposeToolbar';
import { EmailPreview } from '@/propel/components/campaign/EmailPreview';
import { SegmentCreateModal } from '@/propel/components/campaign/SegmentCreateModal';
import {
  type AiPlan,
  type CampaignBuilderHubPayload,
  type DraftCopyResponse,
  type SaveCampaignResponse,
  type SegmentOption,
  type SaveSegmentResponse,
  type SendRequestResponse,
  type TestSendResponse,
} from '@/propel/types/campaignBuilder';

export const WIZARD_STEPS = ['Setup', 'Compose', 'Audience', 'Review'] as const;

// The manual campaign wizard (single-message). Owns ALL campaign state and wires
// every route: draft-copy (AI assist), save-campaign (DRAFT upsert + schedule),
// segment-preview / save-segment / import-segment (Audience), test-send and
// send-request (Review). Ported field-for-field from the Propel in-sandbox
// BuilderSheet, rebuilt on real Mantine controls (Select/Popover/Modal/native
// datetime) — the payoff of graduating off the front-component sandbox.
export const ManualWizard = ({
  hub,
  initialPlan,
  onDone,
}: {
  hub: CampaignBuilderHubPayload;
  initialPlan?: AiPlan | null;
  onDone: () => void;
}) => {
  const notify = usePropelToast();

  // ── campaign state ─────────────────────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'EMAIL' | 'WHATSAPP'>('EMAIL');
  const [objective, setObjective] = useState<'SEGMENT' | 'LISTING'>('SEGMENT');
  const [listingId, setListingId] = useState<string | null>(null);
  const [subject, setSubject] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [language, setLanguage] = useState<'EN' | 'AR'>('EN');
  const [waTemplateId, setWaTemplateId] = useState<string | null>(null);
  const [segmentId, setSegmentId] = useState<string | null>(null);
  const [createdSegments, setCreatedSegments] = useState<SegmentOption[]>([]);
  const [segmentModalOpen, setSegmentModalOpen] = useState(false);
  const [steer, setSteer] = useState('');
  const [permitWarning, setPermitWarning] = useState<string | null>(null);
  const [genState, setGenState] = useState<'idle' | 'generating' | 'failed'>(
    'idle',
  );
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [testState, setTestState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now');
  const [scheduleAt, setScheduleAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [livePreview, setLivePreview] = useState<{
    estimate: number;
    description: string;
  } | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const subjectRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // ── derived picker data ────────────────────────────────────────────────────
  const segments = hub.segments ?? [];
  const listings = hub.listings ?? [];
  const waTemplates = hub.waTemplates ?? [];
  const customFields = hub.customFields ?? [];

  const approvedTemplates = useMemo(
    () => waTemplates.filter((t) => t.approved),
    [waTemplates],
  );
  const customKeys = useMemo(
    () => customFields.map((cf) => cf.key),
    [customFields],
  );
  const segmentSafeEmailKeys = useMemo(
    () => new Set<string>([...BUILDER_MERGE_FIELDS, ...customKeys]),
    [customKeys],
  );

  const allSegments = useMemo<SegmentOption[]>(
    () => [
      ...createdSegments,
      ...segments.filter((s) => !createdSegments.some((cs) => cs.id === s.id)),
    ],
    [createdSegments, segments],
  );
  const segment = useMemo(
    () => allSegments.find((s) => s.id === segmentId) ?? null,
    [allSegments, segmentId],
  );
  const listing = useMemo(
    () => listings.find((l) => l.id === listingId) ?? null,
    [listings, listingId],
  );

  const listingFieldsActive =
    objective === 'LISTING' && Boolean(listingId) && channel === 'EMAIL';
  const composeMergeFields = useMemo<MergeField[]>(
    () =>
      listingFieldsActive
        ? [...BUILDER_MERGE_FIELDS, ...LISTING_MERGE_FIELDS]
        : BUILDER_MERGE_FIELDS,
    [listingFieldsActive],
  );
  const composeAllowedKeys = useMemo(
    () =>
      listingFieldsActive
        ? new Set<string>([...segmentSafeEmailKeys, ...LISTING_MERGE_FIELDS])
        : segmentSafeEmailKeys,
    [listingFieldsActive, segmentSafeEmailKeys],
  );
  const emailPreviewSamples = useMemo<MergeValues>(() => {
    const out: MergeValues = { ...PREVIEW_SAMPLES };
    for (const cf of customFields) (out as Record<string, string>)[cf.key] = cf.value;
    return out;
  }, [customFields]);
  const composePreviewSamples = useMemo<MergeValues>(
    () =>
      listingFieldsActive
        ? { ...emailPreviewSamples, ...listingPreviewSamples(listing?.name ?? null) }
        : emailPreviewSamples,
    [listingFieldsActive, emailPreviewSamples, listing],
  );

  // ── hydrate from an AI plan handoff (once) ─────────────────────────────────
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (!initialPlan || hydratedRef.current) return;
    hydratedRef.current = true;
    setChannel(initialPlan.channel === 'WHATSAPP' ? 'WHATSAPP' : 'EMAIL');
    setLanguage(initialPlan.language === 'AR' ? 'AR' : 'EN');
    if (initialPlan.subject) setSubject(initialPlan.subject);
    if (initialPlan.body) setBodyText(initialPlan.body);
    if (initialPlan.whatsappTemplateId) setWaTemplateId(initialPlan.whatsappTemplateId);
    setName(
      initialPlan.subject?.trim()
        ? initialPlan.subject
        : `AI campaign — ${(initialPlan.segmentDescription ?? '').slice(0, 50)}`,
    );
  }, [initialPlan]);

  // ── caret-true merge-field insert (real focus/setSelectionRange) ───────────
  const insertToken = useCallback(
    (field: string) => {
      const token = `{{${field}}}`;
      const el = bodyRef.current;
      const value = bodyText;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? start;
      const next = value.slice(0, start) + token + value.slice(end);
      setBodyText(next);
      const caret = start + token.length;
      requestAnimationFrame(() => {
        const node = bodyRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(caret, caret);
      });
    },
    [bodyText],
  );

  const applyFormat = useCallback(
    (action: FormatAction) => {
      const el = bodyRef.current;
      const value = bodyText;
      const start = el?.selectionStart ?? value.length;
      const end = el?.selectionEnd ?? start;
      const sel = value.slice(start, end) || action.placeholder;
      const next =
        value.slice(0, start) + action.before + sel + action.after + value.slice(end);
      setBodyText(next);
      const selStart = start + action.before.length;
      const selEnd = selStart + sel.length;
      requestAnimationFrame(() => {
        const node = bodyRef.current;
        if (!node) return;
        node.focus();
        node.setSelectionRange(selStart, selEnd);
      });
    },
    [bodyText],
  );

  // ── validation gates ───────────────────────────────────────────────────────
  const copyTokensFillable = useMemo(
    () =>
      [...parseTemplate(subject).fields, ...parseTemplate(bodyText).fields].every(
        (f) => composeAllowedKeys.has(f),
      ),
    [subject, bodyText, composeAllowedKeys],
  );
  const setupReady =
    Boolean(name.trim()) && (objective === 'SEGMENT' || Boolean(listingId));
  const draftReady =
    channel === 'WHATSAPP'
      ? Boolean(name.trim() && waTemplateId)
      : Boolean(name.trim() && subject.trim() && bodyText.trim() && copyTokensFillable);

  // ── route actions ──────────────────────────────────────────────────────────
  const generate = useCallback(async () => {
    if (genState === 'generating') return;
    setGenState('generating');
    try {
      const res = await callPropelRoute<DraftCopyResponse>(
        '/marketing/draft-copy',
        {
          objective: listingFieldsActive ? 'PROMOTE_LISTING' : 'REACTIVATE_SEGMENT',
          language,
          ...(listingFieldsActive && listingId ? { listingId } : {}),
          ...(segment ? { segmentName: segment.name } : {}),
          ...(steer.trim() ? { extraDirection: steer.trim().slice(0, 300) } : {}),
        },
      );
      if (
        !res ||
        res.error ||
        typeof res.subject !== 'string' ||
        typeof res.body !== 'string'
      ) {
        setGenState('failed');
        notify(envelopeMessage(res, 'Could not draft copy — write it yourself.'), 'error');
        return;
      }
      setSubject(res.subject);
      setBodyText(res.body);
      setPermitWarning(res.permitWarning ?? null);
      setGenState('idle');
    } catch {
      setGenState('failed');
    }
  }, [genState, listingFieldsActive, language, listingId, segment, steer, notify]);

  // Honest re-resolve of the SAVED segment: save-segment with { resolve:true }
  // re-runs the REAL resolver (same code path as the materializer) for this
  // segment id and stamps a fresh lastResolvedCount — the truthful way to refresh
  // a saved audience's estimate. (segment-preview resolves arbitrary CRITERIA,
  // which we don't have here — calling it with an empty list would fabricate a 0,
  // which the "never zero-fill" rule forbids.)
  const runSegmentPreview = useCallback(async () => {
    if (!segmentId || previewing) return;
    setPreviewing(true);
    setLivePreview(null);
    try {
      const res = await callPropelRoute<SaveSegmentResponse>(
        '/marketing/save-segment',
        { segmentId, resolve: true, channel },
      );
      if (res && res.ok && typeof res.estimate === 'number') {
        setLivePreview({
          estimate: res.estimate,
          description: res.description ?? '',
        });
      } else {
        // No fresh number → keep the stamped count, never fabricate one.
        notify(
          envelopeMessage(res, 'Could not refresh the estimate — showing the last count.'),
          'error',
        );
      }
    } catch {
      notify('Could not refresh the estimate — showing the last count.', 'error');
    } finally {
      setPreviewing(false);
    }
  }, [segmentId, previewing, channel, notify]);

  const saveAndReview = useCallback(async () => {
    if (!segmentId || saving) return;
    setSaving(true);
    try {
      const res = await callPropelRoute<SaveCampaignResponse>(
        '/marketing/save-campaign',
        {
          ...(campaignId ? { campaignId } : {}),
          name: name.trim(),
          channel,
          templateSubject: channel === 'WHATSAPP' ? '' : subject,
          templateBody: channel === 'WHATSAPP' ? '' : bodyText,
          templateLanguage: language,
          listingId: listingFieldsActive ? listingId ?? '' : '',
          segmentId,
          whatsappTemplateId: channel === 'WHATSAPP' ? waTemplateId ?? '' : '',
        },
      );
      if (!res || res.error || !res.campaignId) {
        notify(envelopeMessage(res, 'Could not save the campaign.'), 'error');
        return;
      }
      setCampaignId(res.campaignId);
      setTestState('idle');
      setActiveStep(3);
    } catch {
      notify('Could not save the campaign — check your connection.', 'error');
    } finally {
      setSaving(false);
    }
  }, [
    segmentId,
    saving,
    campaignId,
    name,
    channel,
    subject,
    bodyText,
    language,
    listingFieldsActive,
    listingId,
    waTemplateId,
    notify,
  ]);

  const saveDraftOnly = useCallback(async () => {
    if (!segmentId || saving) return;
    setSaving(true);
    try {
      const res = await callPropelRoute<SaveCampaignResponse>(
        '/marketing/save-campaign',
        {
          ...(campaignId ? { campaignId } : {}),
          name: name.trim(),
          channel,
          templateSubject: channel === 'WHATSAPP' ? '' : subject,
          templateBody: channel === 'WHATSAPP' ? '' : bodyText,
          templateLanguage: language,
          listingId: listingFieldsActive ? listingId ?? '' : '',
          segmentId,
          whatsappTemplateId: channel === 'WHATSAPP' ? waTemplateId ?? '' : '',
        },
      );
      if (!res || res.error || !res.campaignId) {
        notify(envelopeMessage(res, 'Could not save the draft.'), 'error');
        return;
      }
      notify('Draft saved — find it on the Campaigns board.', 'success');
      onDone();
    } catch {
      notify('Could not save the draft — check your connection.', 'error');
    } finally {
      setSaving(false);
    }
  }, [
    segmentId,
    saving,
    campaignId,
    name,
    channel,
    subject,
    bodyText,
    language,
    listingFieldsActive,
    listingId,
    waTemplateId,
    notify,
    onDone,
  ]);

  const sendTest = useCallback(async () => {
    if (!campaignId || testState === 'sending') return;
    setTestState('sending');
    try {
      const res = await callPropelRoute<TestSendResponse>('/marketing/test-send', {
        campaignId,
      });
      if (!res || res.error) {
        notify(envelopeMessage(res, 'Test send failed.'), 'error');
        setTestState('idle');
        return;
      }
      notify('Test sent to you.', 'success');
      setTestState('sent');
    } catch {
      notify('Test send failed — check your connection.', 'error');
      setTestState('idle');
    }
  }, [campaignId, testState, notify]);

  const sendNow = useCallback(async () => {
    if (!campaignId || submitting) return;
    setSubmitting(true);
    try {
      const res = await callPropelRoute<SendRequestResponse>(
        '/marketing/send-request',
        { campaignId },
      );
      if (!res || res.error) {
        notify(envelopeMessage(res, 'Could not request the send.'), 'error');
        return;
      }
      notify('Send requested — materializing shortly.', 'success');
      onDone();
    } catch {
      notify('Could not request the send — check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [campaignId, submitting, notify, onDone]);

  const schedule = useCallback(async () => {
    if (!campaignId || submitting) return;
    const iso = dubaiLocalToIso(scheduleAt);
    if (!iso) {
      notify('Pick a date and time first (Asia/Dubai).', 'error');
      return;
    }
    if (Date.parse(iso) <= Date.now()) {
      notify('That time is in the past — pick a future time (Asia/Dubai).', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await callPropelRoute<SaveCampaignResponse>(
        '/marketing/save-campaign',
        { campaignId, scheduledAt: iso },
      );
      if (!res || res.error) {
        notify(envelopeMessage(res, 'Could not schedule the campaign.'), 'error');
        return;
      }
      notify('Campaign scheduled.', 'success');
      onDone();
    } catch {
      notify('Could not schedule — check your connection.', 'error');
    } finally {
      setSubmitting(false);
    }
  }, [campaignId, submitting, scheduleAt, notify, onDone]);

  // ── step navigation ────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    if (activeStep === 0 && !setupReady) return;
    if (activeStep === 1 && !draftReady) return;
    setActiveStep((s) => Math.min(s + 1, 3));
  }, [activeStep, setupReady, draftReady]);
  const goBack = useCallback(() => setActiveStep((s) => Math.max(s - 1, 0)), []);

  const estimate = segment?.lastResolvedCount ?? 0;

  return (
    <Stack gap="md" style={{ flex: 1, minHeight: 0 }}>
      <PropelStepper active={activeStep} />

      <Box style={{ flex: 1, minHeight: 0 }}>
        {activeStep === 0 && (
          <SetupStep
            name={name}
            onName={setName}
            channel={channel}
            onChannel={setChannel}
            objective={objective}
            onObjective={(v) => {
              setObjective(v);
              if (v === 'SEGMENT') {
                setListingId(null);
                setPermitWarning(null);
              }
            }}
            language={language}
            onLanguage={setLanguage}
            listings={listings}
            listingId={listingId}
            onListing={setListingId}
            waUsable={approvedTemplates.length > 0}
          />
        )}

        {activeStep === 1 && (
          <ComposeStep
            channel={channel}
            subject={subject}
            onSubject={setSubject}
            bodyText={bodyText}
            onBody={setBodyText}
            language={language}
            subjectRef={subjectRef}
            bodyRef={bodyRef}
            mergeFields={composeMergeFields}
            customFields={customFields}
            onInsertToken={insertToken}
            onFormat={applyFormat}
            previewSamples={composePreviewSamples}
            permitNumberSample={listingFieldsActive ? 'P-DLD-00000' : undefined}
            steer={steer}
            onSteer={setSteer}
            genState={genState}
            onGenerate={() => void generate()}
            copyTokensFillable={copyTokensFillable}
            waTemplateId={waTemplateId}
            onWaTemplate={setWaTemplateId}
            approvedTemplates={approvedTemplates}
            permitWarning={permitWarning}
          />
        )}

        {activeStep === 2 && (
          <AudienceStep
            allSegments={allSegments}
            segmentId={segmentId}
            onSegment={(id) => {
              setSegmentId(id);
              setLivePreview(null);
            }}
            estimate={estimate}
            livePreview={livePreview}
            previewing={previewing}
            onPreview={() => void runSegmentPreview()}
            onOpenSegmentModal={() => setSegmentModalOpen(true)}
          />
        )}

        {activeStep === 3 && (
          <ReviewStep
            name={name}
            channel={channel}
            segmentName={segment?.name ?? ''}
            estimate={estimate}
            campaignId={campaignId}
            testState={testState}
            onTest={() => void sendTest()}
            sendMode={sendMode}
            onSendMode={setSendMode}
            scheduleAt={scheduleAt}
            onScheduleAt={setScheduleAt}
            permitWarning={permitWarning}
          />
        )}
      </Box>

      {/* footer nav */}
      <Group
        justify="space-between"
        pt="sm"
        style={{ borderTop: '1px solid var(--mantine-color-default-border)' }}
      >
        {activeStep > 0 ? (
          <Button variant="default" onClick={goBack} disabled={submitting}>
            Back
          </Button>
        ) : (
          <span />
        )}
        <Group gap="sm">
          {activeStep === 2 && segmentId && (
            <Button
              variant="default"
              leftSection={<IconDeviceFloppy size={16} />}
              loading={saving}
              onClick={() => void saveDraftOnly()}
            >
              Save draft
            </Button>
          )}
          {activeStep < 2 && (
            <Button
              color="red"
              onClick={goNext}
              disabled={activeStep === 0 ? !setupReady : !draftReady}
            >
              Continue
            </Button>
          )}
          {activeStep === 2 && (
            <Button
              color="red"
              loading={saving}
              disabled={!segmentId}
              onClick={() => void saveAndReview()}
            >
              Continue to review
            </Button>
          )}
          {activeStep === 3 &&
            (sendMode === 'now' ? (
              <Button
                color="red"
                loading={submitting}
                onClick={() => void sendNow()}
              >
                Send now
              </Button>
            ) : (
              <Button
                color="red"
                loading={submitting}
                onClick={() => void schedule()}
              >
                Schedule
              </Button>
            ))}
        </Group>
      </Group>

      <SegmentCreateModal
        opened={segmentModalOpen}
        onClose={() => setSegmentModalOpen(false)}
        channel={channel}
        onCreated={(seg) => {
          setCreatedSegments((prev) => [
            seg,
            ...prev.filter((p) => p.id !== seg.id),
          ]);
          setSegmentId(seg.id);
          setLivePreview(null);
        }}
      />
    </Stack>
  );
};

// ── Stepper header ───────────────────────────────────────────────────────────
const PropelStepper = ({ active }: { active: number }) => (
  <Group gap={0} wrap="nowrap">
    {WIZARD_STEPS.map((label, idx) => {
      const done = idx < active;
      const current = idx === active;
      return (
        <Group key={label} gap={8} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <Box
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              flex: 'none',
              display: 'grid',
              placeItems: 'center',
              fontSize: 12,
              fontWeight: 700,
              background:
                done || current ? 'var(--mantine-color-red-6)' : 'transparent',
              color:
                done || current ? '#fff' : 'var(--mantine-color-dimmed)',
              border:
                done || current
                  ? 'none'
                  : '1.5px solid var(--mantine-color-default-border)',
            }}
          >
            {done ? <IconCheck size={14} /> : idx + 1}
          </Box>
          <Text
            size="sm"
            fw={current ? 700 : 500}
            c={current ? 'var(--mantine-color-text)' : 'dimmed'}
            truncate
          >
            {label}
          </Text>
          {idx < WIZARD_STEPS.length - 1 && (
            <Box
              style={{
                flex: 1,
                height: 1,
                margin: '0 8px',
                background: 'var(--mantine-color-default-border)',
              }}
            />
          )}
        </Group>
      );
    })}
  </Group>
);

// ── Step 1: Setup ────────────────────────────────────────────────────────────
const SetupStep = ({
  name,
  onName,
  channel,
  onChannel,
  objective,
  onObjective,
  language,
  onLanguage,
  listings,
  listingId,
  onListing,
  waUsable,
}: {
  name: string;
  onName: (v: string) => void;
  channel: 'EMAIL' | 'WHATSAPP';
  onChannel: (v: 'EMAIL' | 'WHATSAPP') => void;
  objective: 'SEGMENT' | 'LISTING';
  onObjective: (v: 'SEGMENT' | 'LISTING') => void;
  language: 'EN' | 'AR';
  onLanguage: (v: 'EN' | 'AR') => void;
  listings: { id: string; name: string; permitOk: boolean }[];
  listingId: string | null;
  onListing: (v: string | null) => void;
  waUsable: boolean;
}) => (
  <Stack gap="md" maw={560}>
    <TextInput
      label="Campaign name"
      description="Internal — recipients never see this."
      placeholder="e.g. October Marina re-engagement"
      value={name}
      onChange={(e) => onName(e.currentTarget.value)}
      required
    />
    <Box>
      <Text size="sm" fw={600} mb={6} c="var(--mantine-color-text)">
        Channel
      </Text>
      <SegmentedControl
        value={channel}
        onChange={(v) => onChannel(v as 'EMAIL' | 'WHATSAPP')}
        data={[
          { label: 'Email', value: 'EMAIL' },
          {
            label: waUsable ? 'WhatsApp' : 'WhatsApp (no approved templates)',
            value: 'WHATSAPP',
            disabled: !waUsable,
          },
        ]}
      />
    </Box>
    <Box>
      <Text size="sm" fw={600} mb={6} c="var(--mantine-color-text)">
        Goal
      </Text>
      <SegmentedControl
        value={objective}
        onChange={(v) => onObjective(v as 'SEGMENT' | 'LISTING')}
        data={[
          { label: 'Re-engage an audience', value: 'SEGMENT' },
          {
            label: 'Promote a listing',
            value: 'LISTING',
            disabled: channel === 'WHATSAPP',
          },
        ]}
      />
      {objective === 'LISTING' && (
        <Text size="xs" c="dimmed" mt={6}>
          A listing promo still sends to a segment (picked in Audience); sending is
          gated by the Trakheesi permit.
        </Text>
      )}
    </Box>
    {objective === 'LISTING' && (
      <Select
        label="Listing"
        placeholder="Pick a listing"
        searchable
        value={listingId}
        onChange={onListing}
        data={listings.map((l) => ({
          value: l.id,
          label: l.permitOk ? l.name : `${l.name} (permit needs attention)`,
        }))}
        nothingFoundMessage="No listings available"
      />
    )}
    <Box>
      <Text size="sm" fw={600} mb={6} c="var(--mantine-color-text)">
        Language
      </Text>
      <SegmentedControl
        value={language}
        onChange={(v) => onLanguage(v as 'EN' | 'AR')}
        data={[
          { label: 'English', value: 'EN' },
          { label: 'Arabic', value: 'AR' },
        ]}
      />
    </Box>
  </Stack>
);

// ── Step 2: Compose ──────────────────────────────────────────────────────────
const ComposeStep = ({
  channel,
  subject,
  onSubject,
  bodyText,
  onBody,
  language,
  subjectRef,
  bodyRef,
  mergeFields,
  customFields,
  onInsertToken,
  onFormat,
  previewSamples,
  permitNumberSample,
  steer,
  onSteer,
  genState,
  onGenerate,
  copyTokensFillable,
  waTemplateId,
  onWaTemplate,
  approvedTemplates,
  permitWarning,
}: {
  channel: 'EMAIL' | 'WHATSAPP';
  subject: string;
  onSubject: (v: string) => void;
  bodyText: string;
  onBody: (v: string) => void;
  language: 'EN' | 'AR';
  subjectRef: React.Ref<HTMLInputElement>;
  bodyRef: React.Ref<HTMLTextAreaElement>;
  mergeFields: MergeField[];
  customFields: { id: string; key: string; value: string; label: string }[];
  onInsertToken: (field: string) => void;
  onFormat: (action: FormatAction) => void;
  previewSamples: MergeValues;
  permitNumberSample?: string;
  steer: string;
  onSteer: (v: string) => void;
  genState: 'idle' | 'generating' | 'failed';
  onGenerate: () => void;
  copyTokensFillable: boolean;
  waTemplateId: string | null;
  onWaTemplate: (v: string | null) => void;
  approvedTemplates: { id: string; name: string; languageCode: string }[];
  permitWarning: string | null;
}) => {
  if (channel === 'WHATSAPP') {
    return (
      <Stack gap="md" maw={560}>
        <Select
          label="WhatsApp template"
          description="Only Meta-approved templates can send."
          placeholder="Pick an approved template"
          value={waTemplateId}
          onChange={onWaTemplate}
          data={approvedTemplates.map((t) => ({
            value: t.id,
            label: `${t.name} (${t.languageCode})`,
          }))}
          nothingFoundMessage="No approved templates"
        />
        <Text size="xs" c="dimmed">
          WhatsApp body comes from the approved template — there&rsquo;s nothing to
          write here.
        </Text>
      </Stack>
    );
  }

  return (
    <Grid gutter="lg" style={{ minHeight: 0 }}>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="sm">
          <Group justify="space-between" align="flex-end">
            <Text size="sm" fw={600} c="var(--mantine-color-text)">
              Email content
            </Text>
            <Popover width={300} position="bottom-end" withArrow shadow="md">
              <Popover.Target>
                <Button
                  size="compact-sm"
                  variant="light"
                  color="red"
                  leftSection={<IconSparkles size={14} />}
                  loading={genState === 'generating'}
                >
                  Draft with AI
                </Button>
              </Popover.Target>
              <Popover.Dropdown>
                <Stack gap="xs">
                  <Text size="xs" c="dimmed">
                    Optional steer — what should the copy emphasize?
                  </Text>
                  <Textarea
                    autosize
                    minRows={2}
                    maxRows={4}
                    placeholder="e.g. warm, low-pressure, one clear reply prompt"
                    value={steer}
                    onChange={(e) => onSteer(e.currentTarget.value)}
                  />
                  <Button
                    size="compact-sm"
                    color="red"
                    loading={genState === 'generating'}
                    onClick={onGenerate}
                  >
                    Generate
                  </Button>
                  {genState === 'failed' && (
                    <Text size="xs" c="red">
                      Generation failed — write the copy manually.
                    </Text>
                  )}
                </Stack>
              </Popover.Dropdown>
            </Popover>
          </Group>

          <TextInput
            ref={subjectRef}
            label="Subject"
            placeholder="Subject line"
            value={subject}
            onChange={(e) => onSubject(e.currentTarget.value)}
          />

          <Box>
            <Text size="sm" fw={600} mb={6} c="var(--mantine-color-text)">
              Body
            </Text>
            <ComposeToolbar
              mergeFields={mergeFields}
              customFields={customFields}
              onFormat={onFormat}
              onInsertToken={onInsertToken}
            />
            <Textarea
              ref={bodyRef}
              mt={8}
              autosize
              minRows={10}
              maxRows={18}
              placeholder={
                'Hi {{firstName}},\n\nWrite your message here. Use **bold**, lists, [links](https://…) and [[Buttons]](https://…).'
              }
              value={bodyText}
              onChange={(e) => onBody(e.currentTarget.value)}
            />
          </Box>

          {!copyTokensFillable && (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertCircle size={16} />}
            >
              Your copy uses a merge field this campaign can&rsquo;t fill — it would
              send blank. Remove it or attach a listing.
            </Alert>
          )}
          {permitWarning && (
            <Alert
              color="yellow"
              variant="light"
              icon={<IconAlertCircle size={16} />}
            >
              {permitWarning}
            </Alert>
          )}
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Stack gap="xs">
          <Text size="sm" fw={600} c="var(--mantine-color-text)">
            Live preview
          </Text>
          <EmailPreview
            subject={subject}
            body={bodyText}
            language={language}
            values={previewSamples}
            permitNumber={permitNumberSample}
          />
          <Text size="xs" c="dimmed">
            The real branded email, rendered with sample values. Send a test from
            Review to see it in your inbox.
          </Text>
        </Stack>
      </Grid.Col>
    </Grid>
  );
};

// ── Step 3: Audience ─────────────────────────────────────────────────────────
const AudienceStep = ({
  allSegments,
  segmentId,
  onSegment,
  estimate,
  livePreview,
  previewing,
  onPreview,
  onOpenSegmentModal,
}: {
  allSegments: SegmentOption[];
  segmentId: string | null;
  onSegment: (id: string | null) => void;
  estimate: number;
  livePreview: { estimate: number; description: string } | null;
  previewing: boolean;
  onPreview: () => void;
  onOpenSegmentModal: () => void;
}) => (
  <Stack gap="md" maw={620}>
    <Group justify="space-between" align="flex-end">
      <Text size="sm" fw={600} c="var(--mantine-color-text)">
        Who should receive this?
      </Text>
      <Button
        size="compact-sm"
        variant="light"
        leftSection={<IconPlus size={14} />}
        onClick={onOpenSegmentModal}
      >
        New segment
      </Button>
    </Group>

    <Select
      placeholder={
        allSegments.length === 0 ? 'No saved audiences yet' : 'Pick a segment'
      }
      searchable
      value={segmentId}
      onChange={onSegment}
      leftSection={<IconUsers size={16} />}
      data={allSegments.map((s) => ({
        value: s.id,
        label: `${s.name} · ${s.lastResolvedLabel}`,
      }))}
      nothingFoundMessage="No audiences — create one"
    />

    {segmentId && (
      <Card
        withBorder
        radius="md"
        padding="md"
        style={{ background: 'var(--mantine-color-body)' }}
      >
        <Group justify="space-between" align="center">
          <Box>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Estimated reach
            </Text>
            <Text size="xl" fw={700} c="var(--mantine-color-text)">
              {(livePreview?.estimate ?? estimate).toLocaleString('en-US')}
            </Text>
            <Text size="xs" c="dimmed">
              Estimate — resolved live at send time; the count moves with the data.
            </Text>
          </Box>
          <Button
            variant="default"
            size="compact-sm"
            loading={previewing}
            onClick={onPreview}
          >
            Refresh estimate
          </Button>
        </Group>
        {livePreview?.description && (
          <Text size="xs" c="dimmed" mt="sm">
            {livePreview.description}
          </Text>
        )}
      </Card>
    )}

    {allSegments.length === 0 && (
      <Alert color="gray" variant="light" icon={<IconUsers size={16} />}>
        You don&rsquo;t have any audiences yet. Create one from a CSV/Excel upload
        or live criteria with &ldquo;New segment&rdquo;.
      </Alert>
    )}
  </Stack>
);

// ── Step 4: Review ───────────────────────────────────────────────────────────
const ReviewStep = ({
  name,
  channel,
  segmentName,
  estimate,
  campaignId,
  testState,
  onTest,
  sendMode,
  onSendMode,
  scheduleAt,
  onScheduleAt,
  permitWarning,
}: {
  name: string;
  channel: 'EMAIL' | 'WHATSAPP';
  segmentName: string;
  estimate: number;
  campaignId: string | null;
  testState: 'idle' | 'sending' | 'sent';
  onTest: () => void;
  sendMode: 'now' | 'schedule';
  onSendMode: (v: 'now' | 'schedule') => void;
  scheduleAt: string;
  onScheduleAt: (v: string) => void;
  permitWarning: string | null;
}) => (
  <Stack gap="md" maw={560}>
    <Card
      withBorder
      radius="md"
      padding="md"
      style={{ background: 'var(--mantine-color-body)' }}
    >
      <Stack gap={8}>
        <ReviewRow label="Campaign" value={name} />
        <ReviewRow label="Channel" value={channel === 'WHATSAPP' ? 'WhatsApp' : 'Email'} />
        <ReviewRow label="Audience" value={segmentName || '—'} />
        <ReviewRow
          label="Estimated reach"
          value={estimate.toLocaleString('en-US')}
        />
      </Stack>
    </Card>

    {permitWarning && (
      <Alert color="yellow" variant="light" icon={<IconAlertCircle size={16} />}>
        {permitWarning}
      </Alert>
    )}

    {channel === 'EMAIL' && (
      <Group justify="space-between" align="center">
        <Box>
          <Text size="sm" fw={600} c="var(--mantine-color-text)">
            Send a test to yourself
          </Text>
          <Text size="xs" c="dimmed">
            See the real branded email in your inbox before the blast.
          </Text>
        </Box>
        <Button
          variant="default"
          leftSection={
            testState === 'sent' ? (
              <IconCheck size={16} />
            ) : (
              <IconTestPipe size={16} />
            )
          }
          loading={testState === 'sending'}
          disabled={!campaignId}
          onClick={onTest}
        >
          {testState === 'sent' ? 'Sent — send again' : 'Send test'}
        </Button>
      </Group>
    )}

    <Box>
      <Text size="sm" fw={600} mb={6} c="var(--mantine-color-text)">
        When
      </Text>
      <SegmentedControl
        value={sendMode}
        onChange={(v) => onSendMode(v as 'now' | 'schedule')}
        data={[
          { label: 'Send now', value: 'now' },
          { label: 'Schedule', value: 'schedule' },
        ]}
      />
      {sendMode === 'schedule' && (
        <TextInput
          mt="sm"
          type="datetime-local"
          label="Date & time (Asia/Dubai)"
          leftSection={<IconMail size={16} />}
          value={scheduleAt}
          onChange={(e) => onScheduleAt(e.currentTarget.value)}
        />
      )}
    </Box>
  </Stack>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
  <Group justify="space-between" gap="md" wrap="nowrap">
    <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ flex: 'none' }}>
      {label}
    </Text>
    <Text
      size="sm"
      c="var(--mantine-color-text)"
      ta="right"
      style={{ wordBreak: 'break-word' }}
    >
      {value}
    </Text>
  </Group>
);
