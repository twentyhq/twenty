/* oxlint-disable twenty/no-hardcoded-colors -- the amber lint-warn color (#b8860b)
   is a semantic compliance constant mirrored from the stylesheet; everything else
   reads Mantine bridge tokens. */
import { Button, Group, Select, Switch, Tooltip } from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconAlertTriangle,
  IconBolt,
  IconInfoCircle,
  IconLanguage,
  IconRefresh,
  IconShield,
  IconSparkles,
  IconTag,
  IconX,
} from 'twenty-ui/display';
import {
  aiArabic,
  aiDraft,
  aiHashtags,
  aiLint,
  aiRewrite,
} from '@/propel/lib/socialAiCopy';
import {
  type ComplianceFlag,
  type SocialAiRewrite,
  type SocialAiTone,
} from '@/propel/types/socialAiCopy';

// The AI copy bundle affordances for the composer's "Post copy" field (§15):
//   • tone Select + "Use listing details" → draft a caption from the listing.
//   • rewrite chips: shorter / punchier / add CTA.
//   • hashtags → appends generated #tags to the copy.
//   • Arabic toggle → generates + shows an Arabic version (read-only, RTL).
//   • compliance lint → flags surface under the copy, each dismissible.
//
// This component is presentational + owns ONLY transient AI state (which call is
// in flight, the lint flags, the Arabic text, dismissed flags). The actual copy
// lives in the parent composer; we mutate it via the callbacks below. All network
// calls go through the typed wrappers in lib/socialAiCopy (callPropelRoute).

const TONE_OPTIONS: { value: SocialAiTone; label: string }[] = [
  { value: 'luxury', label: 'Luxury' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'facts', label: 'Just the facts' },
];

const REWRITES: { key: SocialAiRewrite; label: string }[] = [
  { key: 'shorter', label: 'Shorter' },
  { key: 'punchier', label: 'Punchier' },
  { key: 'add-cta', label: 'Add CTA' },
];

// Which AI call is in flight (drives the shimmer + disables the row). 'arabic'
// and 'lint' don't block the textarea, so they animate their own targets.
type Busy = null | 'draft' | SocialAiRewrite | 'hashtags' | 'arabic' | 'lint';

const stableFlagKey = (f: ComplianceFlag, i: number) =>
  `${f.severity}:${f.span}:${i}`;

export const AiCopyControls = ({
  body,
  listingId,
  hasListing,
  noEmoji,
  onReplaceBody,
  onAppendHashtags,
  onError,
  onCopyGenerating,
}: {
  /** the current composer copy — the source for rewrite/arabic/lint */
  body: string;
  /** the attached listing id (server re-resolves its facts) or null */
  listingId: string | null;
  hasListing: boolean;
  /** true when any selected network forbids emoji (asks Arabic for plain text) */
  noEmoji: boolean;
  /** replace the whole composer body (draft / rewrite result) */
  onReplaceBody: (next: string) => void;
  /** append a hashtag line to the composer body */
  onAppendHashtags: (line: string) => void;
  /** surface a route error in the parent's inline error slot */
  onError: (message: string, operatorAction: string | null) => void;
  /** true while a draft/rewrite is generating, so the parent can shimmer the
   *  textarea (the copy is about to be replaced). */
  onCopyGenerating: (generating: boolean) => void;
}) => {
  const reduce = useReducedMotion() ?? false;
  const [tone, setTone] = useState<SocialAiTone>('facts');
  const [busy, setBusy] = useState<Busy>(null);
  const [flags, setFlags] = useState<ComplianceFlag[] | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [arabic, setArabic] = useState<string | null>(null);
  const [arabicOn, setArabicOn] = useState(false);

  const anyBusy = busy !== null;
  const hasCopy = body.trim().length > 0;

  // The textarea shimmers only while the body itself is being (re)generated —
  // draft or any rewrite. hashtags/arabic/lint don't replace the body, so they
  // leave the textarea untouched.
  const bodyGenerating =
    busy === 'draft' || busy === 'shorter' || busy === 'punchier' || busy === 'add-cta';
  useEffect(() => {
    onCopyGenerating(bodyGenerating);
  }, [bodyGenerating, onCopyGenerating]);

  const runDraft = useCallback(async () => {
    if (anyBusy || !hasListing || listingId === null) return;
    setBusy('draft');
    const res = await aiDraft({ listingId, tone });
    setBusy(null);
    if (res.ok) {
      onReplaceBody(res.caption);
      setArabic(null); // a fresh draft invalidates the prior Arabic version
      setArabicOn(false);
    } else {
      onError(res.message, res.operatorAction);
    }
  }, [anyBusy, hasListing, listingId, tone, onReplaceBody, onError]);

  const runRewrite = useCallback(
    async (instruction: SocialAiRewrite) => {
      if (anyBusy || !hasCopy) return;
      setBusy(instruction);
      const res = await aiRewrite({ copy: body, instruction, listingId });
      setBusy(null);
      if (res.ok) {
        onReplaceBody(res.caption);
        setArabic(null);
        setArabicOn(false);
      } else {
        onError(res.message, res.operatorAction);
      }
    },
    [anyBusy, hasCopy, body, listingId, onReplaceBody, onError],
  );

  const runHashtags = useCallback(async () => {
    if (anyBusy) return;
    setBusy('hashtags');
    const res = await aiHashtags({ listingId });
    setBusy(null);
    if (res.ok) {
      onAppendHashtags(res.hashtags.join(' '));
    } else {
      onError(res.message, res.operatorAction);
    }
  }, [anyBusy, listingId, onAppendHashtags, onError]);

  const runLint = useCallback(async () => {
    if (anyBusy || !hasCopy) return;
    setBusy('lint');
    const res = await aiLint({ copy: body, listingId });
    setBusy(null);
    if (res.ok) {
      setDismissed(new Set()); // a fresh check clears prior dismissals
      setFlags(res.flags);
    } else {
      onError(res.message, res.operatorAction);
    }
  }, [anyBusy, hasCopy, body, listingId, onError]);

  // Arabic is a TOGGLE: turning it on generates (once) and reveals the version;
  // turning it off just hides it (the generated text is kept for re-show).
  const toggleArabic = useCallback(
    async (next: boolean) => {
      setArabicOn(next);
      if (!next || arabic !== null || !hasCopy || anyBusy) return;
      setBusy('arabic');
      const res = await aiArabic({ copy: body, stripEmoji: noEmoji, listingId });
      setBusy(null);
      if (res.ok) {
        setArabic(res.caption);
      } else {
        setArabicOn(false);
        onError(res.message, res.operatorAction);
      }
    },
    [arabic, hasCopy, anyBusy, body, noEmoji, listingId, onError],
  );

  // Carry each flag's ORIGINAL index so the dismiss key stays stable when the list
  // is filtered (a dismissed flag's key must match the one we added to `dismissed`).
  const visibleFlags = (flags ?? [])
    .map((f, i) => ({ flag: f, key: stableFlagKey(f, i) }))
    .filter(({ key }) => !dismissed.has(key));

  return (
    <div>
      {/* ── controls row ── */}
      <div className="propel-ai-row">
        <Select
          size="xs"
          w={130}
          data={TONE_OPTIONS}
          value={tone}
          onChange={(v) => v && setTone(v as SocialAiTone)}
          aria-label="Caption tone"
          disabled={anyBusy}
          allowDeselect={false}
        />
        <Tooltip
          label={
            hasListing
              ? 'Generate a caption from the listing details'
              : 'Attach a live listing first'
          }
          withArrow
        >
          <Button
            size="compact-xs"
            variant="light"
            color="grape"
            leftSection={<IconSparkles size={13} />}
            onClick={() => void runDraft()}
            disabled={!hasListing || anyBusy}
            loading={busy === 'draft'}
          >
            Use listing details
          </Button>
        </Tooltip>

        <div className="propel-ai-divider" />

        {REWRITES.map((r) => (
          <Tooltip key={r.key} label={hasCopy ? `Rewrite: ${r.label.toLowerCase()}` : 'Write some copy first'} withArrow>
            <Button
              size="compact-xs"
              variant="subtle"
              color="gray"
              leftSection={r.key === 'add-cta' ? <IconBolt size={12} /> : <IconRefresh size={12} />}
              onClick={() => void runRewrite(r.key)}
              disabled={!hasCopy || anyBusy}
              loading={busy === r.key}
            >
              {r.label}
            </Button>
          </Tooltip>
        ))}

        <div className="propel-ai-divider" />

        <Tooltip label="Add relevant + location hashtags" withArrow>
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            leftSection={<IconTag size={12} />}
            onClick={() => void runHashtags()}
            disabled={anyBusy}
            loading={busy === 'hashtags'}
          >
            Hashtags
          </Button>
        </Tooltip>

        <Tooltip label={hasCopy ? 'Check for risky claims' : 'Write some copy first'} withArrow>
          <Button
            size="compact-xs"
            variant="subtle"
            color="gray"
            leftSection={<IconShield size={12} />}
            onClick={() => void runLint()}
            disabled={!hasCopy || anyBusy}
            loading={busy === 'lint'}
          >
            Check copy
          </Button>
        </Tooltip>

        <div className="propel-ai-divider" />

        <Tooltip label={hasCopy ? 'Show an Arabic version' : 'Write some copy first'} withArrow>
          <Switch
            size="xs"
            checked={arabicOn}
            onChange={(e) => void toggleArabic(e.currentTarget.checked)}
            disabled={!hasCopy || (anyBusy && busy !== 'arabic')}
            label={
              <Group gap={4} wrap="nowrap">
                <IconLanguage size={13} />
                <span>عربي</span>
              </Group>
            }
          />
        </Tooltip>
      </div>

      {/* ── Arabic version (read-only, RTL) ── */}
      <AnimatePresence initial={false}>
        {arabicOn && arabic !== null ? (
          <motion.div
            key="propel-arabic"
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: 'blur(6px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.14 } }}
            transition={{ duration: 0.28 }}
            style={{ marginTop: 8 }}
          >
            <div className="propel-ai-flag" data-severity="info">
              <span className="propel-ai-flag-body propel-ai-arabic" dir="rtl">
                {arabic}
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* ── compliance flags ── */}
      <AnimatePresence initial={false}>
        {visibleFlags.length > 0 ? (
          <motion.div
            key="propel-ai-flags"
            className="propel-ai-flags"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px)' }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.2 }}
          >
            {visibleFlags.map(({ flag: f, key }) => {
              const Icon = f.severity === 'info' ? IconInfoCircle : IconAlertTriangle;
              return (
                <div key={key} className="propel-ai-flag" data-severity={f.severity}>
                  <Icon size={14} className="propel-ai-flag-icon" data-severity={f.severity} />
                  <span className="propel-ai-flag-body">
                    {f.span ? (
                      <>
                        <span className="propel-ai-flag-span">{f.span}</span>{' '}
                      </>
                    ) : null}
                    {f.advice}
                  </span>
                  <button
                    type="button"
                    className="propel-ai-flag-dismiss"
                    aria-label="Dismiss"
                    onClick={() =>
                      setDismissed((prev) => {
                        const nxt = new Set(prev);
                        nxt.add(key);
                        return nxt;
                      })
                    }
                  >
                    <IconX size={12} />
                  </button>
                </div>
              );
            })}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
