/* oxlint-disable twenty/no-hardcoded-colors -- the per-network chip brand colors
   are external constants (each platform's brand), set via a CSS variable consumed
   by the token-driven stylesheet; status/limit reds are semantic constants. */
import {
  Button,
  Checkbox,
  Group,
  Select,
  Text,
  Textarea,
  Tooltip,
} from '@mantine/core';
import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconAlertTriangle,
  IconCalendar,
  IconCheck,
  IconId,
  IconInfoCircle,
  IconPhoto,
  IconShield,
  IconUpload,
  IconX,
} from 'twenty-ui/display';
import { AiCopyControls } from '@/propel/components/calendar/AiCopyControls';
import { AiImageControls } from '@/propel/components/calendar/AiImageControls';
import { ComposerPreview } from '@/propel/components/calendar/ComposerPreview';
import {
  StyledComposerBackdrop,
  StyledComposerOverlay,
  StyledComposerPanel,
} from '@/propel/components/calendar/composerStyles';
import { CHANNEL_META } from '@/propel/lib/socialCalendarConfig';
import { generateImage } from '@/propel/lib/socialAiImage';
import {
  fetchPhotoBytes,
  makeBrandCard,
} from '@/propel/lib/socialBrandCard';
import { parseMediaRefs } from '@/propel/lib/socialPostDetail';
import { type SocialImageAspect } from '@/propel/types/socialAiImage';
import {
  type ComposeMode,
  type ComposerFormState,
  type ComposerMedia,
  MODE_LABEL,
  SCHEDULE_PRESETS,
  type SaveOutcome,
  counterRows,
  formFromPost,
  localInputToIso,
  mediaKindOf,
  presetToLocalInput,
  savePost,
  uploadMedia,
  validateForm,
} from '@/propel/lib/socialComposer';
import {
  type SocialListing,
  type SocialNetwork,
  type SocialPost,
} from '@/propel/types/socialCalendar';

// The two-pane compose surface (§11): LEFT form + RIGHT live per-channel preview.
// Opens as a right-side panel (same flow/easing as the detail drawer). Handles
// CREATE (post === null) and EDIT (post is a DRAFT/SCHEDULED record). On success
// it closes and asks the page to refresh so the new/edited pill appears.
//
// STUBBED for later slices (clearly marked inline):
//   • "Use listing details" / AI caption button → present but disabled (AI slice).
//   • drag-to-reschedule on the calendar (S4) — not here.
//   • Publish-now / Delete / Retry / Duplicate from the detail drawer (S4).
// The CREATE + EDIT save flow itself is fully functional in S3.

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

const uid = () =>
  `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Build the initial form for create vs edit vs duplicate. For a prefilled date
// (day-cell "+"), the composer opens in schedule mode with that datetime pre-set.
// For a duplicate, we prefill the source post's content but DROP the schedule (a
// copy starts as a fresh draft the operator re-times) — and crucially carry NO
// postId, so save creates a brand-new record.
const initialForm = (
  editPost: SocialPost | null,
  duplicateSource: SocialPost | null,
  connectedNetworks: SocialNetwork[],
  prefillScheduledLocal: string | null,
): ComposerFormState => {
  if (editPost !== null) {
    const media = parseMediaRefs(editPost.mediaRefs);
    return formFromPost(editPost, media);
  }
  if (duplicateSource !== null) {
    // Reuse formFromPost to copy body/networks/listing/media, then strip the
    // schedule so the duplicate opens as a clean draft (no time, no postId path).
    const media = parseMediaRefs(duplicateSource.mediaRefs);
    const base = formFromPost(duplicateSource, media);
    return { ...base, mode: 'draft', scheduledLocal: '' };
  }
  return {
    body: '',
    networks: connectedNetworks.length === 1 ? [...connectedNetworks] : [],
    listingId: null,
    attestedNoProperty: false,
    media: [],
    mode: prefillScheduledLocal !== null ? 'schedule' : 'draft',
    scheduledLocal: prefillScheduledLocal ?? '',
  };
};

export type ComposerOpen =
  | { kind: 'create'; prefillScheduledLocal?: string | null }
  | { kind: 'edit'; post: SocialPost }
  // S4: "Duplicate" from the detail drawer — prefills from `source` but creates a
  // NEW post (no postId). Treated as a create for save purposes.
  | { kind: 'duplicate'; source: SocialPost };

export const PostComposer = ({
  open,
  connectedNetworks,
  listings,
  onClose,
  onSaved,
}: {
  /** null = composer closed (drives AnimatePresence) */
  open: ComposerOpen | null;
  connectedNetworks: SocialNetwork[];
  listings: SocialListing[] | undefined;
  onClose: () => void;
  /** called after a successful save so the page reloads the calendar */
  onSaved: () => void;
}) => {
  const reduce = useReducedMotion() ?? false;

  return (
    <AnimatePresence>
      {open !== null ? (
        <StyledComposerOverlay
          key="propel-composer"
          role="dialog"
          aria-modal="true"
          aria-label={open.kind === 'edit' ? 'Edit post' : 'Compose post'}
          // (duplicate + create both read as "Compose post" — both create a record)
        >
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <StyledComposerBackdrop onClick={onClose} aria-hidden="true" />
          </motion.div>

          <motion.div
            style={{ position: 'relative', height: '100%', maxWidth: '100vw' }}
            initial={
              reduce ? { opacity: 0 } : { transform: 'translateX(100%)' }
            }
            animate={
              reduce ? { opacity: 1 } : { transform: 'translateX(0%)' }
            }
            exit={
              reduce
                ? { opacity: 0, transition: { duration: 0.16 } }
                : {
                    transform: 'translateX(100%)',
                    transition: { duration: 0.22, ease: EASE_OUT },
                  }
            }
            transition={
              reduce ? { duration: 0.18 } : { duration: 0.3, ease: EASE_OUT }
            }
          >
            <ComposerBody
              // Remount per open identity so form state resets cleanly between
              // a create, an edit, and a duplicate (and between different posts).
              key={
                open.kind === 'edit'
                  ? `edit-${open.post.id}`
                  : open.kind === 'duplicate'
                    ? `dup-${open.source.id}`
                    : 'create'
              }
              open={open}
              connectedNetworks={connectedNetworks}
              listings={listings}
              onClose={onClose}
              onSaved={onSaved}
            />
          </motion.div>
        </StyledComposerOverlay>
      ) : null}
    </AnimatePresence>
  );
};

const ComposerBody = ({
  open,
  connectedNetworks,
  listings,
  onClose,
  onSaved,
}: {
  open: ComposerOpen;
  connectedNetworks: SocialNetwork[];
  listings: SocialListing[] | undefined;
  onClose: () => void;
  onSaved: () => void;
}) => {
  const reduce = useReducedMotion() ?? false;
  const editing = open.kind === 'edit';
  const editPost = editing ? open.post : null;
  // A duplicate prefills from a source post but saves as a NEW record (no postId).
  const duplicateSource = open.kind === 'duplicate' ? open.source : null;
  const prefill =
    open.kind === 'create' ? (open.prefillScheduledLocal ?? null) : null;

  const [form, setForm] = useState<ComposerFormState>(() =>
    initialForm(editPost, duplicateSource, connectedNetworks, prefill),
  );
  const [activePreview, setActivePreview] = useState<SocialNetwork | null>(
    () => form.networks[0] ?? connectedNetworks[0] ?? null,
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<SaveOutcome & { ok: false } | null>(
    null,
  );
  // True while an AI draft/rewrite is in flight — shimmers the textarea (§15).
  const [aiGenerating, setAiGenerating] = useState(false);
  // True while a branded card is compositing (gates the button + shimmers it, §15).
  const [brandCardBusy, setBrandCardBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOverAdd, setDragOverAdd] = useState(false);
  // The tile index a carousel drag started from. This is transient gesture state
  // that must NOT trigger a re-render on every pointer move (the visual drop
  // marker is the separate `dropBefore` state), so a ref is the right tool here.
  // oxlint-disable-next-line twenty/no-state-useref
  const dragFromRef = useRef<number | null>(null);
  const [dropBefore, setDropBefore] = useState<number | null>(null);

  const patch = (p: Partial<ComposerFormState>) =>
    setForm((f) => ({ ...f, ...p }));

  const toggleNetwork = (n: SocialNetwork) => {
    setForm((f) => {
      const on = f.networks.includes(n);
      const networks = on
        ? f.networks.filter((x) => x !== n)
        : [...f.networks, n];
      return { ...f, networks };
    });
    // If we just turned ON a channel and nothing is previewed yet, point the
    // preview at it. Deselecting a previewed channel is handled at render time
    // (the active network falls back to the first selected one), so we don't need
    // to chase it here.
    if (!form.networks.includes(n)) {
      setActivePreview((cur) => cur ?? n);
    }
  };

  // The channel actually shown in the preview: the chosen tab if it's still
  // selected, else the first selected channel, else none.
  const previewNetwork: SocialNetwork | null =
    activePreview !== null && form.networks.includes(activePreview)
      ? activePreview
      : (form.networks[0] ?? null);

  const counters = useMemo(
    () => counterRows(form.body, form.networks),
    [form.body, form.networks],
  );

  const blocking = useMemo(() => validateForm(form), [form]);
  const canSave = blocking.length === 0 && !saving;

  // ── media ──────────────────────────────────────────────────────────────
  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    for (const file of list) {
      const id = uid();
      const objectUrl = URL.createObjectURL(file);
      const kind = mediaKindOf(file.type, file.name);
      // optimistic uploading tile
      setForm((f) => ({
        ...f,
        media: [
          ...f.media,
          { id, url: null, objectUrl, kind, name: file.name, status: 'uploading', error: null },
        ],
      }));
      void uploadMedia(file).then((res) => {
        setForm((f) => ({
          ...f,
          media: f.media.map((m) =>
            m.id === id
              ? res.ok
                ? { ...m, url: res.url, kind: mediaKindOf(res.contentType, res.url), status: 'ready', error: null }
                : { ...m, status: 'error', error: res.message }
              : m,
          ),
        }));
      });
    }
  };

  // AI errors surface in the same inline slot the save flow uses (an AI failure
  // reads as a NETWORK-class SaveOutcome). Shared by the copy bundle + image gen.
  const surfaceAiError = useCallback(
    (message: string, operatorAction: string | null) => {
      setSaveError({ ok: false, code: 'AI', message, operatorAction });
    },
    [],
  );

  // Generate a brand image. The parent owns the lifecycle (NOT the control) so the
  // in-flight state participates in the SAME save gate as a file upload: we insert
  // a placeholder `uploading` media tile immediately, so validateForm's
  // isUploadingMedia blocks Save until the image resolves — no race where Save
  // fires mid-generation and drops the image (codex P2). On success the tile
  // becomes a ready image at the stored URL; on failure it surfaces the error and
  // the tile is dropped. Returns the optimized prompt (or null) so the control can
  // show "we refined your prompt to: …".
  const generateBrandImage = useCallback(
    async (args: {
      prompt: string;
      aspect: SocialImageAspect;
      brandHints: string | null;
    }): Promise<{ ok: true; optimizedPrompt: string | null } | { ok: false }> => {
      const id = uid();
      setForm((f) => ({
        ...f,
        media: [
          ...f.media,
          { id, url: null, objectUrl: null, kind: 'image', name: 'Generating image…', status: 'uploading', error: null },
        ],
      }));
      const res = await generateImage(args);
      if (res.ok) {
        setForm((f) => ({
          ...f,
          media: f.media.map((m) =>
            m.id === id
              ? { ...m, url: res.url, kind: mediaKindOf('image/png', res.url), name: 'Generated image', status: 'ready', error: null }
              : m,
          ),
        }));
        return { ok: true, optimizedPrompt: res.optimizedPrompt };
      }
      // drop the placeholder; surface the error in the composer's inline slot
      setForm((f) => ({ ...f, media: f.media.filter((m) => m.id !== id) }));
      surfaceAiError(res.message, res.operatorAction);
      return { ok: false };
    },
    [surfaceAiError],
  );

  // Make a branded "Just Listed" card from the attached listing + the FIRST ready
  // photo already on the post. DETERMINISTIC (not generative) — the route composites
  // the real photo + real listing facts + Hub branding via the image-service
  // sidecar and returns a stored URL we attach as a NEW media tile (the branded card
  // sits ALONGSIDE the source photo; we never replace it). Same lifecycle as a file
  // upload / generated image: insert a placeholder `uploading` tile immediately so
  // validateForm's isUploadingMedia blocks Save until the card lands (no race), then
  // resolve it to a ready image. brandCardBusy gates the button + drives the §15
  // shimmer over it. The button only shows when a listing is attached AND a ready
  // photo exists, so `sourcePhoto` is present whenever this fires.
  const makeBrandCardFromListing = useCallback(async () => {
    // form.listingId null/'' means no listing attached — the button is hidden then,
    // but guard anyway (don't read hasListing here: it's declared later in render,
    // and the empty-string + null check below is the same condition).
    if (brandCardBusy || form.listingId === null || form.listingId === '') return;
    const sourcePhoto = form.media.find(
      (m) => m.status === 'ready' && m.kind === 'image' && m.url !== null,
    );
    if (!sourcePhoto || sourcePhoto.url === null) return;

    setBrandCardBusy(true);
    setSaveError(null);
    const id = uid();
    setForm((f) => ({
      ...f,
      media: [
        ...f.media,
        { id, url: null, objectUrl: null, kind: 'image', name: 'Making branded card…', status: 'uploading', error: null },
      ],
    }));

    // Re-read the source photo's bytes from its (signed) public URL — the tile only
    // retains the URL, not the original File.
    const photo = await fetchPhotoBytes(sourcePhoto.url);
    if (photo === null) {
      setForm((f) => ({ ...f, media: f.media.filter((m) => m.id !== id) }));
      surfaceAiError(
        "Couldn't read the source photo to make a card.",
        'Re-add the photo and try again.',
      );
      setBrandCardBusy(false);
      return;
    }

    const res = await makeBrandCard({
      listingId: form.listingId,
      imageBytes: photo.base64,
      contentType: photo.contentType,
    });
    if (res.ok) {
      setForm((f) => ({
        ...f,
        media: f.media.map((m) =>
          m.id === id
            ? { ...m, url: res.url, kind: mediaKindOf('image/jpeg', res.url), name: 'Branded card', status: 'ready', error: null }
            : m,
        ),
      }));
    } else {
      setForm((f) => ({ ...f, media: f.media.filter((m) => m.id !== id) }));
      surfaceAiError(res.message, res.operatorAction);
    }
    setBrandCardBusy(false);
  }, [brandCardBusy, form.listingId, form.media, surfaceAiError]);

  const onPickFiles = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = ''; // allow re-selecting the same file
  };

  const removeMedia = (id: string) => {
    setForm((f) => {
      const m = f.media.find((x) => x.id === id);
      if (m?.objectUrl) URL.revokeObjectURL(m.objectUrl);
      return { ...f, media: f.media.filter((x) => x.id !== id) };
    });
  };

  // drag-reorder within the carousel (real DOM drag — fine outside the sandbox)
  const onTileDragStart = (index: number) => {
    dragFromRef.current = index;
  };
  const onTileDragOver = (index: number, e: DragEvent) => {
    e.preventDefault();
    setDropBefore(index);
  };
  const onTileDrop = (index: number) => {
    const from = dragFromRef.current;
    dragFromRef.current = null;
    setDropBefore(null);
    if (from === null || from === index) return;
    setForm((f) => {
      const next = [...f.media];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return { ...f, media: next };
    });
  };

  const onAddDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOverAdd(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  // ── schedule ─────────────────────────────────────────────────────────────
  const setMode = (mode: ComposeMode) => patch({ mode });
  const applyPreset = (key: (typeof SCHEDULE_PRESETS)[number]['key']) =>
    patch({ mode: 'schedule', scheduledLocal: presetToLocalInput(key) });

  // ── listing ──────────────────────────────────────────────────────────────
  const listingOptions = useMemo(
    () =>
      (listings ?? []).map((l) => ({
        value: l.id,
        label: l.name ?? 'Unnamed listing',
      })),
    [listings],
  );
  const hasListing = form.listingId !== null && form.listingId !== '';

  // "Make a branded card" is offered only when a listing is attached AND at least one
  // READY photo is present — the card is composited from that real photo + the
  // listing's real facts. (A video tile or a still-uploading tile doesn't qualify.)
  const hasReadyPhoto = form.media.some(
    (m) => m.status === 'ready' && m.kind === 'image' && m.url !== null,
  );
  const canMakeBrandCard = hasListing && hasReadyPhoto;

  // ── AI copy bundle wiring ──────────────────────────────────────────────────
  // The AI controls replace or extend the body; errors surface in the same inline
  // slot the save flow uses (an AI failure reads as a NETWORK-class SaveOutcome).
  const setBody = useCallback((next: string) => patch({ body: next }), []);
  const appendHashtags = useCallback((line: string) => {
    if (!line.trim()) return;
    setForm((f) => {
      const sep = f.body.trim().length === 0 ? '' : f.body.endsWith('\n') ? '' : '\n\n';
      return { ...f, body: `${f.body}${sep}${line.trim()}` };
    });
  }, []);

  // ── save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    setSaveError(null);
    const scheduledAt =
      form.mode === 'now'
        ? new Date().toISOString()
        : form.mode === 'schedule'
          ? localInputToIso(form.scheduledLocal)
          : null;
    // Only public URLs go to save-post; uploading tiles are excluded (validation
    // blocks save while any are still uploading, so ready ones are all we have).
    const imageUrls = form.media
      .filter((m) => m.status === 'ready' && m.url !== null)
      .map((m) => m.url as string);

    const outcome = await savePost({
      ...(editing && editPost ? { postId: editPost.id } : {}),
      body: form.body,
      networks: form.networks,
      imageUrls,
      listingId: hasListing ? form.listingId : null,
      attestedNoProperty: form.attestedNoProperty,
      scheduledAt,
    });
    setSaving(false);
    if (outcome.ok) {
      onSaved();
    } else {
      setSaveError(outcome);
    }
  };

  const primaryLabel = MODE_LABEL[form.mode];

  return (
    <StyledComposerPanel>
      {/* ── Header ── */}
      <div className="propel-composer-header">
        <Text fw={700} size="sm">
          {editing ? 'Edit post' : 'Compose post'}
        </Text>
        <Button
          size="compact-sm"
          variant="subtle"
          color="gray"
          onClick={onClose}
          leftSection={<IconX size={15} />}
        >
          Close
        </Button>
      </div>

      <div className="propel-composer-body">
        {/* ── LEFT: form ── */}
        <div className="propel-composer-form">
          {/* Channels */}
          <div className="propel-field">
            <span className="propel-field-label">Channels</span>
            <div className="propel-chip-row">
              {CHANNEL_NETWORK_ORDER.map((n) => {
                const connected = connectedNetworks.includes(n);
                const on = form.networks.includes(n);
                const meta = CHANNEL_META[n];
                const Icon = meta.Icon;
                const chip = (
                  <div
                    key={n}
                    className="propel-chip"
                    data-on={on}
                    data-disabled={!connected}
                    style={{ ['--chip-color' as string]: meta.color }}
                    role="button"
                    tabIndex={connected ? 0 : -1}
                    aria-pressed={on}
                    aria-disabled={!connected}
                    onClick={() => {
                      if (connected) toggleNetwork(n);
                    }}
                    onKeyDown={(e) => {
                      if (connected && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        toggleNetwork(n);
                      }
                    }}
                  >
                    <Icon size={14} style={{ color: meta.color }} />
                    {meta.label}
                    {on ? <IconCheck size={13} /> : null}
                  </div>
                );
                return connected ? (
                  chip
                ) : (
                  <Tooltip key={n} label="Connect this channel first" withArrow>
                    {chip}
                  </Tooltip>
                );
              })}
            </div>
          </div>

          {/* Post copy + AI bundle + per-network counters */}
          <div className="propel-field">
            <span className="propel-field-label">Post copy</span>
            {/* AI copy bundle: tone draft, rewrite, hashtags, Arabic, lint. */}
            <div style={{ marginBottom: 8 }}>
              <AiCopyControls
                body={form.body}
                listingId={hasListing ? form.listingId : null}
                hasListing={hasListing}
                noEmoji={false}
                onReplaceBody={setBody}
                onAppendHashtags={appendHashtags}
                onError={surfaceAiError}
                onCopyGenerating={setAiGenerating}
              />
            </div>
            {/* The textarea shimmers (§15) while a draft/rewrite is in flight; the
                returned copy is already faded in via the value swap. */}
            <div style={{ position: 'relative' }}>
              <Textarea
                autosize
                minRows={4}
                maxRows={12}
                placeholder="What do you want to share?"
                value={form.body}
                onChange={(e) => patch({ body: e.currentTarget.value })}
                disabled={aiGenerating}
              />
              <AnimatePresence>
                {aiGenerating ? (
                  <motion.div
                    key="propel-copy-shimmer"
                    className="propel-ai-shimmer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: 0.18 } }}
                    transition={{ duration: 0.16 }}
                    aria-hidden="true"
                  />
                ) : null}
              </AnimatePresence>
            </div>
            {counters.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                {counters.map((c) => (
                  <div
                    key={c.network}
                    className="propel-counter-row"
                    data-level={c.level}
                  >
                    <span>{CHANNEL_META[c.network].label}</span>
                    <span>
                      {c.count.toLocaleString()} / {c.limit.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Listing + permit badge */}
          <div className="propel-field">
            <span className="propel-field-label">Listing (optional)</span>
            <Select
              placeholder="Attach a listing…"
              data={listingOptions}
              value={form.listingId}
              searchable
              clearable
              nothingFoundMessage="No live listings"
              onChange={(value) =>
                patch({
                  listingId: value,
                  // attaching a listing supersedes the no-property attestation
                  ...(value !== null ? { attestedNoProperty: false } : {}),
                })
              }
            />
            {hasListing ? (
              // Permit badge. The status payload does NOT carry the live Trakheesi
              // permit number/expiry (it's on the listing→permit relation server-
              // side), so we show a "verified at publish" note — never a fabricated
              // number. The save route runs the real permit gate and returns
              // COMPLIANCE_BLOCK inline if it fails. A route extension will surface
              // the live number/expiry later (flagged for a follow-up slice).
              <div className="propel-permit-badge">
                <IconShield
                  size={16}
                  style={{ color: 'var(--mantine-color-dimmed)', flex: 'none' }}
                />
                <Text size="xs" c="dimmed">
                  Trakheesi permit is verified at publish. If the permit is missing
                  or expired, saving is blocked with a clear reason.
                </Text>
              </div>
            ) : null}
          </div>

          {/* Compliance attestation (only when no listing) */}
          {!hasListing ? (
            <div className="propel-field">
              <span className="propel-field-label">Compliance</span>
              <Checkbox
                checked={form.attestedNoProperty}
                onChange={(e) =>
                  patch({ attestedNoProperty: e.currentTarget.checked })
                }
                label="This post does not advertise a specific property."
                size="sm"
              />
            </div>
          ) : null}

          {/* Media carousel */}
          <div className="propel-field">
            <span className="propel-field-label">
              Media{' '}
              {form.networks.includes('INSTAGRAM')
                ? '(Instagram needs at least one image)'
                : '(optional)'}
            </span>
            {/* Generative brand-image affordance (§15): describe a graphic → AI
                generates it → it attaches as a ready media tile. Brand/graphic
                only; the route blocks photoreal-property prompts. */}
            <div style={{ marginBottom: 8 }}>
              <AiImageControls onGenerate={generateBrandImage} />
            </div>

            {/* "Make a branded card" (§15): DETERMINISTIC — composites the real
                listing photo + facts + Hub branding into a "Just Listed" card and
                attaches it as a NEW tile (alongside the source photo). Shown only
                when a listing is attached AND a ready photo exists. While
                compositing, the §15 shimmer rides over the button. */}
            {canMakeBrandCard ? (
              <div
                style={{ marginBottom: 8, position: 'relative', display: 'inline-block' }}
              >
                <Tooltip
                  label="Composite the listing photo + details into a branded “Just Listed” card"
                  withArrow
                  multiline
                  w={240}
                >
                  <Button
                    size="compact-xs"
                    variant="light"
                    color="red"
                    leftSection={<IconId size={13} />}
                    onClick={() => void makeBrandCardFromListing()}
                    disabled={brandCardBusy}
                    loading={brandCardBusy}
                  >
                    Make a branded card
                  </Button>
                </Tooltip>
                <AnimatePresence>
                  {brandCardBusy ? (
                    <motion.div
                      key="propel-brandcard-shimmer"
                      className="propel-ai-shimmer"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.18 } }}
                      transition={{ duration: 0.16 }}
                      aria-hidden="true"
                    />
                  ) : null}
                </AnimatePresence>
              </div>
            ) : null}
            <div className="propel-media-strip">
              <AnimatePresence initial={false}>
                {form.media.map((m, index) => (
                  <motion.div
                    key={m.id}
                    layout={!reduce}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
                    exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.16, ease: EASE_OUT }}
                  >
                    <MediaTile
                      media={m}
                      index={index}
                      isDropBefore={dropBefore === index}
                      onRemove={() => removeMedia(m.id)}
                      onDragStart={() => onTileDragStart(index)}
                      onDragOver={(e) => onTileDragOver(index, e)}
                      onDrop={() => onTileDrop(index)}
                      onDragEnd={() => {
                        dragFromRef.current = null;
                        setDropBefore(null);
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add tile = browse + drop zone */}
              <div
                className="propel-media-add"
                data-dragover={dragOverAdd}
                role="button"
                tabIndex={0}
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragEnter={() => setDragOverAdd(true)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverAdd(true);
                }}
                onDragLeave={() => setDragOverAdd(false)}
                onDrop={onAddDrop}
              >
                <IconUpload size={16} />
                <span>Add</span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                hidden
                onChange={onPickFiles}
              />
            </div>
            <Text size="xs" c="dimmed" mt={6}>
              Up to 7 MB each. Drag thumbnails to reorder.
            </Text>
          </div>

          {/* Schedule */}
          <div className="propel-field">
            <span className="propel-field-label">Schedule</span>
            <Group gap={6}>
              {(['now', 'schedule', 'draft'] as ComposeMode[]).map((m) => (
                <Button
                  key={m}
                  size="compact-sm"
                  variant={form.mode === m ? 'filled' : 'default'}
                  color={form.mode === m ? 'red' : 'gray'}
                  onClick={() => setMode(m)}
                >
                  {m === 'now' ? 'Post now' : m === 'schedule' ? 'Schedule' : 'Save draft'}
                </Button>
              ))}
            </Group>

            {form.mode === 'schedule' ? (
              <div style={{ marginTop: 10 }}>
                <input
                  type="datetime-local"
                  value={form.scheduledLocal}
                  onChange={(e) =>
                    patch({ scheduledLocal: e.currentTarget.value })
                  }
                  style={{
                    background: 'var(--mantine-color-body)',
                    border: '1px solid var(--mantine-color-default-border)',
                    borderRadius: 8,
                    color: 'var(--mantine-color-text)',
                    fontSize: 13,
                    padding: '7px 10px',
                  }}
                />
                <div className="propel-preset-row">
                  {SCHEDULE_PRESETS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      className="propel-preset"
                      onClick={() => applyPreset(p.key)}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {/* Validation summary + server error envelope */}
          {blocking.length > 0 ? (
            <div className="propel-field">
              <div className="propel-validation">
                <IconInfoCircle
                  size={14}
                  style={{ flex: 'none', marginTop: 1 }}
                />
                <span>{blocking.join(' ')}</span>
              </div>
            </div>
          ) : null}

          {saveError !== null ? (
            <div className="propel-save-error" role="alert">
              <Group gap={6} align="flex-start" wrap="nowrap">
                <IconAlertTriangle
                  size={15}
                  style={{ color: 'var(--failed-fill)', flex: 'none', marginTop: 1 }}
                />
                <div>
                  <Text size="xs" fw={600}>
                    {saveError.message}
                  </Text>
                  {saveError.operatorAction !== null ? (
                    <Text size="xs" c="dimmed" mt={2}>
                      {saveError.operatorAction}
                    </Text>
                  ) : null}
                </div>
              </Group>
            </div>
          ) : null}

          <div style={{ height: 8 }} />
        </div>

        {/* ── RIGHT: live preview ── */}
        <div className="propel-composer-preview">
          <span className="propel-field-label">Preview</span>
          {form.networks.length > 1 ? (
            <Group gap={4} mb={10} wrap="wrap">
              {form.networks.map((n) => {
                const meta = CHANNEL_META[n];
                const Icon = meta.Icon;
                const on = previewNetwork === n;
                return (
                  <Button
                    key={n}
                    size="compact-xs"
                    variant={on ? 'light' : 'subtle'}
                    color={on ? 'red' : 'gray'}
                    leftSection={<Icon size={12} style={{ color: meta.color }} />}
                    onClick={() => setActivePreview(n)}
                  >
                    {meta.label}
                  </Button>
                );
              })}
            </Group>
          ) : null}
          <ComposerPreview
            activeNetwork={previewNetwork}
            body={form.body}
            media={form.media}
          />
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="propel-composer-footer">
        <Button variant="default" color="gray" onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button
          color="red"
          leftSection={<IconCalendar size={14} />}
          onClick={() => void handleSave()}
          disabled={!canSave}
          loading={saving}
        >
          {primaryLabel}
        </Button>
      </div>
    </StyledComposerPanel>
  );
};

// Stable channel order in the chip row (matches the filter legend).
const CHANNEL_NETWORK_ORDER: SocialNetwork[] = [
  'FACEBOOK',
  'INSTAGRAM',
  'LINKEDIN',
  'TIKTOK',
];

const MediaTile = ({
  media,
  index,
  isDropBefore,
  onRemove,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  media: ComposerMedia;
  index: number;
  isDropBefore: boolean;
  onRemove: () => void;
  onDragStart: () => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: () => void;
  onDragEnd: () => void;
}) => {
  const src = media.objectUrl ?? media.url;
  const draggable = media.status === 'ready';
  return (
    <div
      className="propel-media-tile"
      data-index={index}
      data-dropbefore={isDropBefore}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
    >
      {media.status === 'uploading' ? (
        <div className="propel-media-tile propel-media-tile--uploading">
          {/* preview blob shows behind the label while uploading */}
          {src !== null ? (
            media.kind === 'video' ? (
              <video src={src} muted preload="metadata" />
            ) : (
              <img src={src} alt="" style={{ opacity: 0.55 }} />
            )
          ) : null}
        </div>
      ) : media.status === 'error' ? (
        <div className="propel-media-tile--error">
          <IconAlertTriangle size={14} />
          {media.error ?? 'Failed'}
        </div>
      ) : src !== null ? (
        media.kind === 'video' ? (
          <video src={src} muted preload="metadata" />
        ) : (
          <img src={src} alt="" />
        )
      ) : (
        <div className="propel-media-tile--uploading">
          <IconPhoto size={16} />
        </div>
      )}
      <button
        type="button"
        className="propel-media-remove"
        aria-label="Remove media"
        onClick={onRemove}
      >
        <IconX size={12} />
      </button>
    </div>
  );
};
