import { Box, Button, Center, Stack, Text } from '@mantine/core';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IconAlertTriangle,
  IconFileText,
  IconRefresh,
} from 'twenty-ui/display';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { PropelMantineProvider } from '@/propel/components/PropelMantineProvider';
import { A2APrepareForm } from '@/propel/components/a2a/A2APrepareForm';
import { A2AStatusStrip } from '@/propel/components/a2a/A2AStatusStrip';
import { ContactRunner } from '@/propel/components/a2a/ContactRunner';
import { DocumensoEmbed } from '@/propel/components/a2a/DocumensoEmbed';
import { SendPanel } from '@/propel/components/a2a/SendPanel';
import { useA2AStudio } from '@/propel/hooks/useA2AStudio';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import { type A2APrefill, type A2AVariant } from '@/propel/types/a2a';

// The graduated A2A Studio hero (Plane 3, lane #15). Rides Twenty's DefaultLayout
// (nav + top bar come from the router <Outlet/>); this page owns the header + the
// prepare → review/sign → send → done flow, in its own Mantine scope. It is
// opportunity-scoped: the Plane-2 "Prepare A2A" entry deep-links
// /a2a-studio?opportunityId=…&variant=A|B. Identity is server-derived from the
// session token by the /a2a/* routes; this page never sends an acting-user id.
//
// The embedded Documenso signing view (DocumensoEmbed) is the whole reason this
// graduates out of the front-component sandbox — the box can't host an external
// iframe.

const isVariant = (v: string | null): v is A2AVariant => v === 'A' || v === 'B';

export const A2AStudioPage = () => {
  const [searchParams] = useSearchParams();
  const notify = usePropelToast();

  const opportunityId = searchParams.get('opportunityId');
  const variantParam = searchParams.get('variant');
  const variant: A2AVariant = isVariant(variantParam) ? variantParam : 'B';

  // Seed prefill from any extra query params the entry may pass through (all
  // optional — the route returns the authoritative CRM prefill on create-draft).
  const seedPrefill = useMemo<A2APrefill>(() => {
    const out: A2APrefill = {};
    const name = searchParams.get('propertyName');
    if (name !== null) out.propertyName = name;
    const buyer = searchParams.get('buyerName');
    if (buyer !== null) out.buyerName = buyer;
    return out;
    // Read once from the initial query string; the form owns edits thereafter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const studio = useA2AStudio(opportunityId, variant, seedPrefill);
  const [contactOpen, setContactOpen] = useState(false);

  const noOpportunity = opportunityId === null || opportunityId === '';

  return (
    <PropelMantineProvider>
      <PageContainer>
        <PageHeader title="A2A Studio" Icon={IconFileText} />

        <Box style={{ padding: '8px 16px 24px', flex: 1, minHeight: 0 }}>
          {noOpportunity ? (
            <Center h={320}>
              <Stack gap="sm" align="center" maw={420}>
                <IconAlertTriangle size={22} />
                <Text fw={600}>Open A2A Studio from an Opportunity</Text>
                <Text size="sm" c="dimmed" ta="center">
                  The agreement-to-act is built from a deal. Use the
                  &ldquo;Prepare A2A&rdquo; action on a Secondary or Sell
                  opportunity to start here with everything prefilled.
                </Text>
              </Stack>
            </Center>
          ) : (
            <Stack gap="lg">
              {/* Status strip appears once a draft exists. */}
              {studio.draft !== null ? (
                <A2AStatusStrip
                  status={studio.status}
                  signedPdfUrl={studio.signedPdfUrl}
                  auditUrl={studio.auditUrl}
                />
              ) : null}

              {/* ── prepare ─────────────────────────────────────────────── */}
              {studio.step === 'prepare' ? (
                <A2APrepareForm
                  variant={variant}
                  prefill={studio.prefill}
                  counterparty={studio.counterparty}
                  creating={studio.creating}
                  errorMessage={studio.errorMessage}
                  missing={studio.missing}
                  onPatch={studio.setPrefill}
                  onOpenContact={() => setContactOpen(true)}
                  onCreateDraft={() => void studio.createDraft()}
                />
              ) : null}

              {/* ── review & sign (RERA embed) ──────────────────────────── */}
              {studio.step === 'signEmbed' &&
              studio.draft?.ourRecipientToken != null ? (
                <Stack gap="md">
                  <Text size="sm" c="dimmed">
                    Review the agreement, fill any remaining fields, and sign.
                    When you finish, you&rsquo;ll send it to the counterparty.
                  </Text>
                  <DocumensoEmbed
                    token={studio.draft.ourRecipientToken}
                    signerName={studio.prefill.buyerName}
                    onCompleted={() => {
                      notify(
                        'Signed — now send it to the counterparty.',
                        'success',
                      );
                      studio.onEmbedCompleted();
                    }}
                    onError={(e) =>
                      notify(e || 'The signing view hit an error.', 'error')
                    }
                  />
                </Stack>
              ) : null}

              {/* ── junior bake (no embed) ──────────────────────────────── */}
              {studio.step === 'bakeJunior' ? (
                <Center h={240}>
                  <Stack gap="sm" align="center" maw={420}>
                    <Text fw={600}>Signing on your behalf…</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      You&rsquo;re not RERA-registered, so we&rsquo;re applying
                      your brokerage&rsquo;s registered agent signature and
                      stamp to the agreement. This takes a moment.
                    </Text>
                  </Stack>
                </Center>
              ) : null}

              {/* ── send ────────────────────────────────────────────────── */}
              {studio.step === 'send' ? (
                <SendPanel
                  counterparty={studio.counterparty}
                  signingUrl={studio.draft?.counterpartySigningUrl ?? null}
                  sending={studio.sending}
                  alreadySent={studio.status === 'OUT_FOR_SIGNATURE'}
                  onOpenContact={() => setContactOpen(true)}
                  onSend={async (channels) => {
                    const ok = await studio.send(channels);
                    if (ok) {
                      notify('Sent to the counterparty.', 'success');
                    } else {
                      notify(studio.errorMessage ?? 'Could not send.', 'error');
                    }
                    return ok;
                  }}
                />
              ) : null}

              {/* ── done ────────────────────────────────────────────────── */}
              {studio.step === 'done' ? (
                <Center h={240}>
                  <Stack gap="sm" align="center" maw={460}>
                    <Text fw={700} fz="lg">
                      Agreement signed
                    </Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Both parties have the fully signed &amp; stamped PDF, and
                      it&rsquo;s attached to the deal. Links are in the status
                      strip above.
                    </Text>
                  </Stack>
                </Center>
              ) : null}

              {/* ── error ───────────────────────────────────────────────── */}
              {studio.step === 'error' ? (
                <Center h={240}>
                  <Stack gap="md" align="center" maw={420}>
                    <IconAlertTriangle size={22} />
                    <Text size="sm" c="dimmed" ta="center">
                      {studio.errorMessage ?? 'Something went wrong.'}
                    </Text>
                    <Button
                      variant="default"
                      leftSection={<IconRefresh size={14} />}
                      onClick={studio.reset}
                    >
                      Start over
                    </Button>
                  </Stack>
                </Center>
              ) : null}
            </Stack>
          )}
        </Box>
      </PageContainer>

      <ContactRunner
        opened={contactOpen}
        onClose={() => setContactOpen(false)}
        onSearch={studio.searchPeople}
        onLink={studio.linkCounterparty}
        onCreate={studio.createCounterparty}
      />
    </PropelMantineProvider>
  );
};
