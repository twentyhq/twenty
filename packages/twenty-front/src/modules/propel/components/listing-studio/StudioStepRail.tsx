import { Box, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconCheck } from 'twenty-ui/display';
import {
  STUDIO_STEP_META,
  stepIndex,
} from '@/propel/lib/listingStudioConfig';
import { type StudioStep } from '@/propel/types/listingStudio';

// The left step rail (lane spec §6) — the 6-step state machine's view. The rail
// never re-mounts (spec §16 "Frame & rail"); only the active marker + the
// number→check crossfade transition. A completed step (index < current) shows a
// check; the current step is ringed; future steps are dimmed. Clicking a visited
// step jumps back to it (forward jumps are gated by the parent — Next advances).
//
// Motion: the spec's `--ease-out` on transform/opacity only; instant for the
// number→check swap behind opacity (we keep it CSS-cheap and reduced-motion-safe
// — opacity/color survive prefers-reduced-motion).

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const StudioStepRail = ({
  current,
  onSelect,
}: {
  current: StudioStep;
  /** Jump to a step. The parent decides whether the jump is allowed. */
  onSelect: (step: StudioStep) => void;
}) => {
  const currentIdx = stepIndex(current);

  return (
    <Stack
      gap={4}
      style={{
        width: 220,
        flexShrink: 0,
        paddingRight: 12,
        borderRight: '1px solid var(--mantine-color-default-border)',
      }}
    >
      {STUDIO_STEP_META.map((meta, idx) => {
        const isCurrent = idx === currentIdx;
        const isDone = idx < currentIdx;
        const isFuture = idx > currentIdx;

        return (
          <UnstyledButton
            key={meta.id}
            onClick={() => onSelect(meta.id)}
            disabled={isFuture}
            aria-current={isCurrent ? 'step' : undefined}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '8px 10px',
              borderRadius: 8,
              cursor: isFuture ? 'default' : 'pointer',
              opacity: isFuture ? 0.5 : 1,
              background: isCurrent
                ? 'var(--mantine-color-red-light, rgba(225,29,46,0.08))'
                : 'transparent',
              transition: `background 200ms ${EASE_OUT}, opacity 200ms ${EASE_OUT}`,
            }}
          >
            {/* Step marker: number until done, then a check (crossfade via opacity). */}
            <Box
              style={{
                position: 'relative',
                width: 22,
                height: 22,
                flexShrink: 0,
                borderRadius: '50%',
                marginTop: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `1.5px solid ${
                  isCurrent || isDone
                    ? 'var(--mantine-color-red-6, #e11d2e)'
                    : 'var(--mantine-color-default-border)'
                }`,
                background: isDone
                  ? 'var(--mantine-color-red-6, #e11d2e)'
                  : 'transparent',
                transition: `background 200ms ${EASE_OUT}, border-color 200ms ${EASE_OUT}`,
              }}
            >
              <Text
                size="xs"
                fw={600}
                style={{
                  position: 'absolute',
                  opacity: isDone ? 0 : 1,
                  color: isCurrent
                    ? 'var(--mantine-color-red-6, #e11d2e)'
                    : 'var(--mantine-color-dimmed)',
                  transition: `opacity 160ms ${EASE_OUT}`,
                }}
              >
                {idx + 1}
              </Text>
              <Box
                style={{
                  position: 'absolute',
                  display: 'flex',
                  opacity: isDone ? 1 : 0,
                  color: '#fff',
                  transition: `opacity 160ms ${EASE_OUT}`,
                }}
              >
                <IconCheck size={13} />
              </Box>
            </Box>

            <Box style={{ minWidth: 0 }}>
              <Text
                size="sm"
                fw={isCurrent ? 600 : 500}
                c={isCurrent ? undefined : 'dimmed'}
                style={{ lineHeight: 1.2 }}
              >
                {meta.label}
              </Text>
              {isCurrent && (
                <Text size="xs" c="dimmed" mt={2} style={{ lineHeight: 1.25 }}>
                  {meta.blurb}
                </Text>
              )}
            </Box>
          </UnstyledButton>
        );
      })}
    </Stack>
  );
};
