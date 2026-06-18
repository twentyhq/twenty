import { Box, Button, Group, Text } from '@mantine/core';
import { useMemo } from 'react';
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingSkyscraper,
  IconCheck,
  IconTrash,
} from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { StudioLauncher } from '@/propel/components/listing-studio/StudioLauncher';
import { StudioPreviewPane } from '@/propel/components/listing-studio/StudioPreviewPane';
import { StudioStepBody } from '@/propel/components/listing-studio/StudioStepBody';
import { StudioStepRail } from '@/propel/components/listing-studio/StudioStepRail';
import {
  useListingStudioDraft,
  useResumableDraft,
} from '@/propel/hooks/useListingStudioDraft';
import {
  isFirstStep,
  isLastStep,
  stepAtIndex,
  stepIndex,
  STUDIO_STEP_META,
} from '@/propel/lib/listingStudioConfig';
import { type SaveState } from '@/propel/hooks/useListingStudioDraft';

// The graduated Listing Studio hero (lane #9, slice S2 = the SHELL). Rides Twenty's
// DefaultLayout (nav + top bar from the router <Outlet/>); this page owns the
// header + the launcher / 6-step studio shell, in its own Mantine scope.
//
// S2 deliverable: the shell — the frame, the 6-step rail (state machine), the live
// PF preview pane, client-side draft + resume, and the two entry points (A from
// scratch, B from a CRM property). The per-step FORMS are basic/stubbed (only
// Details & price is a real form, to prove the rail→draft→preview loop); S3–S8
// replace the stubs (intake/AI, photos/watermark, write-up, permit, publish).
//
// Reaches the PF client transitively: this hero → callPropelRoute('/listing-studio/*')
// → the CRM logic-functions (coordinator-gated proxies) → the S1 pf-atlas client.

const SAVE_LABEL: Record<SaveState, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: "Couldn't save",
};

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

export const ListingStudioPage = () => {
  const resumable = useResumableDraft();
  const {
    draft,
    preview,
    saveState,
    starting,
    startScratch,
    startFromProperty,
    resume,
    patchFacts,
    goToStep,
    discard,
  } = useListingStudioDraft();

  const currentMeta = useMemo(
    () =>
      draft !== null
        ? STUDIO_STEP_META.find((m) => m.id === draft.step) ?? null
        : null,
    [draft],
  );

  const goNext = () => {
    if (draft === null) return;
    goToStep(stepAtIndex(stepIndex(draft.step) + 1));
  };
  const goBack = () => {
    if (draft === null) return;
    goToStep(stepAtIndex(stepIndex(draft.step) - 1));
  };

  // ── Launcher (no active draft) ──────────────────────────────────────────────
  if (draft === null) {
    return (
      <PropelMantineProvider>
        <PageContainer>
          <PageHeader title="Listing Studio" Icon={IconBuildingSkyscraper} />
          <Box style={{ padding: '8px 16px 24px', flex: 1, minHeight: 0 }}>
            <StudioLauncher
              resumable={resumable}
              starting={starting}
              onStartScratch={startScratch}
              onStartFromProperty={startFromProperty}
              onResume={resume}
            />
          </Box>
        </PageContainer>
      </PropelMantineProvider>
    );
  }

  // ── Studio shell (active draft) ─────────────────────────────────────────────
  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="Listing Studio" Icon={IconBuildingSkyscraper}>
          <Group gap="sm" wrap="nowrap">
            {saveState !== 'idle' && (
              <Group gap={4} c={saveState === 'error' ? 'red' : 'dimmed'}>
                {saveState === 'saved' && <IconCheck size={13} />}
                <Text size="xs">{SAVE_LABEL[saveState]}</Text>
              </Group>
            )}
            <Button
              size="xs"
              variant="subtle"
              color="gray"
              leftSection={<IconTrash size={13} />}
              onClick={discard}
            >
              Discard
            </Button>
          </Group>
        </PageHeader>

        <Box
          style={{
            display: 'flex',
            gap: 20,
            padding: '8px 16px 24px',
            flex: 1,
            minHeight: 0,
            alignItems: 'flex-start',
          }}
        >
          {/* Left: the 6-step rail (never re-mounts). */}
          <StudioStepRail current={draft.step} onSelect={goToStep} />

          {/* Center: the active step body + footer nav. Only this pane transitions
              between steps (spec §16 "Frame & rail"). */}
          <Box style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Box
              key={draft.step}
              style={{
                flex: 1,
                minWidth: 0,
                animation: `studioStepIn 240ms ${EASE_OUT}`,
              }}
            >
              <StudioStepBody
                step={draft.step}
                facts={draft.facts}
                onPatch={patchFacts}
              />
            </Box>

            <Group justify="space-between" mt="lg">
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={14} />}
                onClick={goBack}
                disabled={isFirstStep(draft.step)}
              >
                Back
              </Button>
              <Text size="xs" c="dimmed">
                Step {stepIndex(draft.step) + 1} of {STUDIO_STEP_META.length}
                {currentMeta ? ` · ${currentMeta.label}` : ''}
              </Text>
              <Button
                color="red"
                rightSection={<IconArrowRight size={14} />}
                onClick={goNext}
                disabled={isLastStep(draft.step)}
              >
                Next
              </Button>
            </Group>
          </Box>

          {/* Right: the live PF preview (builds as you go). */}
          <StudioPreviewPane preview={preview} />
        </Box>
      </PageContainer>

      {/* Step-advance entrance keyframe (transform+opacity only; honored only when
          the user hasn't asked to reduce motion — spec §16). */}
      <style>{`
        @keyframes studioStepIn {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          @keyframes studioStepIn {
            from { opacity: 0; transform: none; }
            to   { opacity: 1; transform: none; }
          }
        }
      `}</style>
    </PropelMantineProvider>
  );
};
