import {
  Alert,
  Box,
  Button,
  Group,
  List,
  NumberInput,
  Paper,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconArrowRight,
  IconUser,
  IconUserPlus,
} from 'twenty-ui/display';
import {
  type A2APrefill,
  type CounterpartyPerson,
  type A2AVariant,
} from '@/propel/types/a2a';

// The "prepare" step (design §5 A2APrepareForm): CRM-prefilled required + optional
// fields. Most fields are optional — the agent fills the rest inside the embedded
// Documenso editor — so only a minimal set is surfaced here. The counterparty is
// captured/linked via the inline ContactRunner (its channels drive the SendPanel
// later), opened from this form so the agent sets it up front.

const VARIANT_LABEL: Record<A2AVariant, string> = {
  A: 'Seller representation (Variant A)',
  B: 'Buyer representation (Variant B)',
};

export const A2APrepareForm = ({
  variant,
  prefill,
  counterparty,
  creating,
  errorMessage,
  missing,
  onPatch,
  onOpenContact,
  onCreateDraft,
}: {
  variant: A2AVariant;
  prefill: A2APrefill;
  counterparty: CounterpartyPerson | null;
  creating: boolean;
  errorMessage: string | null;
  missing: string[] | null;
  onPatch: (patch: Partial<A2APrefill>) => void;
  onOpenContact: () => void;
  onCreateDraft: () => void;
}) => {
  return (
    <Stack gap="lg" maw={680}>
      <Box>
        <Text size="sm" c="dimmed">
          {VARIANT_LABEL[variant]}
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          We&rsquo;ve prefilled what the deal already knows. Adjust anything
          here, then review and fill the rest of the agreement in the next step.
        </Text>
      </Box>

      {/* The not-ready checklist (422 from create-draft) — what doc-service still
          needs from the CRM before a draft can be built. */}
      {missing !== null && missing.length > 0 ? (
        <Alert
          color="yellow"
          variant="light"
          icon={<IconAlertTriangle size={16} />}
          title="A few details are still needed"
        >
          <List size="sm" spacing={2}>
            {missing.map((m) => (
              <List.Item key={m}>{m}</List.Item>
            ))}
          </List>
        </Alert>
      ) : null}

      {/* A transport / unexpected error that isn't a readiness checklist. */}
      {errorMessage !== null && (missing === null || missing.length === 0) ? (
        <Alert
          color="red"
          variant="light"
          icon={<IconAlertTriangle size={16} />}
        >
          {errorMessage}
        </Alert>
      ) : null}

      <Stack gap="md">
        <TextInput
          label="Property"
          placeholder="e.g. Marina Gate · Unit 1203"
          value={prefill.propertyName ?? ''}
          onChange={(e) => onPatch({ propertyName: e.currentTarget.value })}
        />
        <Group grow align="flex-start">
          <NumberInput
            label="Property price (AED)"
            placeholder="0"
            thousandSeparator=","
            min={0}
            value={prefill.propertyPriceAed ?? ''}
            onChange={(v) =>
              onPatch({
                propertyPriceAed: typeof v === 'number' ? v : undefined,
              })
            }
          />
          <NumberInput
            label="Commission (%)"
            placeholder="2"
            min={0}
            max={100}
            decimalScale={2}
            value={prefill.commissionPercent ?? ''}
            onChange={(v) =>
              onPatch({
                commissionPercent: typeof v === 'number' ? v : undefined,
              })
            }
          />
        </Group>
        <TextInput
          label="Buyer / client name"
          placeholder="Optional"
          value={prefill.buyerName ?? ''}
          onChange={(e) => onPatch({ buyerName: e.currentTarget.value })}
        />
        <Textarea
          label="Remarks"
          placeholder="Optional notes that appear on the agreement"
          autosize
          minRows={2}
          maxRows={6}
          value={prefill.remarks ?? ''}
          onChange={(e) => onPatch({ remarks: e.currentTarget.value })}
        />
      </Stack>

      {/* Counterparty — the other broker. Captured/linked here so the SendPanel
          can light its WhatsApp/email channels once the doc is ready. */}
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{ background: 'var(--mantine-color-body)' }}
      >
        <Group justify="space-between" wrap="nowrap" align="center">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase">
              Counterparty broker
            </Text>
            {counterparty !== null ? (
              <Box mt={4}>
                <Text size="sm" fw={600} truncate>
                  {counterparty.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {[
                    counterparty.brokerage,
                    counterparty.email,
                    counterparty.phone,
                  ]
                    .filter((v) => v != null && v !== '')
                    .join(' · ') || 'No contact channels yet'}
                </Text>
              </Box>
            ) : (
              <Text size="sm" c="dimmed" mt={4}>
                Not set — you can add them now or before sending.
              </Text>
            )}
          </Box>
          <Button
            variant="default"
            leftSection={
              counterparty !== null ? (
                <IconUser size={14} />
              ) : (
                <IconUserPlus size={14} />
              )
            }
            onClick={onOpenContact}
            style={{ flex: 'none' }}
          >
            {counterparty !== null ? 'Change' : 'Add contact'}
          </Button>
        </Group>
      </Paper>

      <Group justify="flex-end">
        <Button
          color="red"
          rightSection={<IconArrowRight size={16} />}
          loading={creating}
          onClick={onCreateDraft}
        >
          Create draft
        </Button>
      </Group>
    </Stack>
  );
};
