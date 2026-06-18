import { Button, Group, Select, Text, Textarea, Tooltip } from '@mantine/core';
import { useCallback, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  IconChevronDown,
  IconSparkles,
  IconWand,
  IconX,
} from 'twenty-ui/display';
import { type SocialImageAspect } from '@/propel/types/socialAiImage';

// The composer's GENERATIVE image affordance (§15), living in the Media area.
//   • A "Generate image" disclosure button opens an inline panel.
//   • A prompt field + aspect select + optional brand hints + Generate button.
//   • While generating, a shimmer rides over the panel (no spinner) — same §15
//     treatment as the AI copy bundle.
//   • The PARENT owns the actual generation + media lifecycle (onGenerate): it
//     inserts a placeholder uploading tile so Save is gated until the image lands
//     (no save-mid-generation race), then attaches the stored URL as a ready tile.
//   • On success we surface the optimizer's refined prompt ("we refined your prompt
//     to: …") so the operator can tweak + regenerate.
//   • A clear "Brand graphics only — not photos of a real property" note keeps the
//     compliance line visible; the route also blocks photoreal-property prompts.
//
// Presentational + owns ONLY transient PANEL state (open, prompt, aspect, hints,
// local busy for the shimmer, last optimized prompt). It does NOT call the route
// or touch media directly.

const ASPECT_OPTIONS: { value: SocialImageAspect; label: string }[] = [
  { value: 'square', label: 'Square (1:1)' },
  { value: 'portrait', label: 'Portrait (4:5)' },
  { value: 'landscape', label: 'Landscape (1.91:1)' },
  { value: 'story', label: 'Story (9:16)' },
];

const EASE_OUT: [number, number, number, number] = [0.23, 1, 0.32, 1];

export type GenerateBrandImage = (args: {
  prompt: string;
  aspect: SocialImageAspect;
  brandHints: string | null;
}) => Promise<{ ok: true; optimizedPrompt: string | null } | { ok: false }>;

export const AiImageControls = ({
  onGenerate,
}: {
  /** parent-owned generate: inserts a placeholder media tile, calls the route,
   *  attaches the result, and surfaces errors. Resolves with the optimized prompt
   *  on success (so we can show "we refined your prompt to: …"). */
  onGenerate: GenerateBrandImage;
}) => {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<SocialImageAspect>('square');
  const [brandHints, setBrandHints] = useState('');
  const [busy, setBusy] = useState(false);
  // The optimizer's refined prompt from the last successful generate — shown so the
  // operator can see how we reshaped the brief, and tweak + regenerate.
  const [lastOptimized, setLastOptimized] = useState<string | null>(null);

  const canGenerate = prompt.trim().length > 0 && !busy;

  const run = useCallback(async () => {
    if (prompt.trim().length === 0 || busy) return;
    setBusy(true);
    const res = await onGenerate({
      prompt: prompt.trim(),
      aspect,
      brandHints: brandHints.trim() || null,
    });
    setBusy(false);
    if (res.ok) {
      setLastOptimized(res.optimizedPrompt);
    }
  }, [prompt, aspect, brandHints, busy, onGenerate]);

  return (
    <div className="propel-aiimg">
      {/* Disclosure button — sits in the media area next to "Add". */}
      <Button
        size="compact-xs"
        variant={open ? 'light' : 'subtle'}
        color="grape"
        leftSection={<IconWand size={13} />}
        rightSection={
          <IconChevronDown
            size={12}
            style={{
              transform: open ? 'rotate(180deg)' : 'none',
              transition: 'transform 160ms',
            }}
          />
        }
        onClick={() => setOpen((o) => !o)}
      >
        Generate image
      </Button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="propel-aiimg-panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            style={{ overflow: 'hidden' }}
          >
            <div className="propel-aiimg-panel" style={{ position: 'relative' }}>
              <Text size="xs" c="dimmed" className="propel-aiimg-note">
                Brand graphics only — stat cards, festive posts, branded designs.
                Not photos of a real property.
              </Text>

              <Textarea
                autosize
                minRows={2}
                maxRows={5}
                placeholder="Describe the graphic (e.g. a Dubai market-update card, navy + red, modern flat design)"
                value={prompt}
                onChange={(e) => setPrompt(e.currentTarget.value)}
                disabled={busy}
              />

              <Group gap={8} mt={8} align="flex-end" wrap="wrap">
                <Select
                  size="xs"
                  w={170}
                  label="Aspect"
                  data={ASPECT_OPTIONS}
                  value={aspect}
                  onChange={(v) => v && setAspect(v as SocialImageAspect)}
                  disabled={busy}
                  allowDeselect={false}
                  comboboxProps={{ withinPortal: true }}
                />
                <Tooltip
                  label={canGenerate ? 'Generate one image' : 'Describe the graphic first'}
                  withArrow
                >
                  <Button
                    size="compact-sm"
                    color="grape"
                    leftSection={<IconSparkles size={13} />}
                    onClick={() => void run()}
                    disabled={!canGenerate}
                    loading={busy}
                  >
                    Generate
                  </Button>
                </Tooltip>
              </Group>

              <Textarea
                mt={8}
                autosize
                minRows={1}
                maxRows={3}
                placeholder="Brand direction (optional) — colors, style, mood"
                value={brandHints}
                onChange={(e) => setBrandHints(e.currentTarget.value)}
                disabled={busy}
              />

              {/* Optimized-prompt reveal: "we refined your prompt to: …" */}
              <AnimatePresence initial={false}>
                {lastOptimized !== null && !busy ? (
                  <motion.div
                    key="propel-aiimg-optimized"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, transform: 'translateY(-4px)' }}
                    animate={reduce ? { opacity: 1 } : { opacity: 1, transform: 'translateY(0px)' }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="propel-aiimg-optimized">
                      <Text size="xs" fw={600} c="dimmed">
                        We refined your prompt to:
                      </Text>
                      <Text size="xs" c="dimmed" mt={2}>
                        {lastOptimized}
                      </Text>
                      <button
                        type="button"
                        className="propel-aiimg-optimized-dismiss"
                        aria-label="Dismiss"
                        onClick={() => setLastOptimized(null)}
                      >
                        <IconX size={11} />
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* §15 shimmer over the whole panel while generating. */}
              <AnimatePresence>
                {busy ? (
                  <motion.div
                    key="propel-aiimg-shimmer"
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
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
