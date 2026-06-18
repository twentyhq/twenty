import {
  Alert,
  Box,
  Button,
  CopyButton,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconCopy,
  IconLink,
  IconMail,
  IconSend,
  IconUserPlus,
} from 'twenty-ui/display';
import { type CounterpartyPerson, type SendChannel } from '@/propel/types/a2a';

// The "send" step (design §5 SendPanel / D4): contextual WhatsApp / email /
// copy-link buttons that light up based on the counterparty channels we hold.
// WhatsApp is the DEFAULT when a phone exists (the WhatsApp-first delivery wired
// in doc-service). Each action calls /a2a/send with the chosen channel; copy-link
// is always available and copies the live counterparty signing URL.

const waText = (name: string | null): string =>
  `Hi${name != null && name !== '' ? ` ${name}` : ''}, please review and sign the agreement-to-act here:`;

export const SendPanel = ({
  counterparty,
  signingUrl,
  sending,
  alreadySent,
  onOpenContact,
  onSend,
}: {
  counterparty: CounterpartyPerson | null;
  /** Live counterparty link — only valid after send activates the envelope. */
  signingUrl: string | null;
  sending: boolean;
  alreadySent: boolean;
  onOpenContact: () => void;
  onSend: (channels: SendChannel[]) => Promise<boolean>;
}) => {
  const hasPhone =
    counterparty?.phone != null && counterparty.phone.trim() !== '';
  const hasEmail =
    counterparty?.email != null && counterparty.email.trim() !== '';

  // No counterparty at all → must capture one before any channel makes sense.
  if (counterparty === null) {
    return (
      <Stack gap="md" maw={560}>
        <Alert
          color="blue"
          variant="light"
          icon={<IconAlertTriangle size={16} />}
          title="Add the counterparty first"
        >
          We need the other broker&rsquo;s contact to send the agreement and
          deliver the signed copy.
        </Alert>
        <Group>
          <Button
            color="red"
            leftSection={<IconUserPlus size={14} />}
            onClick={onOpenContact}
          >
            Add counterparty
          </Button>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" maw={560}>
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{ background: 'var(--mantine-color-body)' }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="sm" fw={600} truncate>
              {counterparty.name}
            </Text>
            <Text size="xs" c="dimmed" truncate>
              {[counterparty.brokerage, counterparty.email, counterparty.phone]
                .filter((v) => v != null && v !== '')
                .join(' · ') || 'No channels on file'}
            </Text>
          </Box>
          <Button
            variant="subtle"
            color="gray"
            size="xs"
            onClick={onOpenContact}
            style={{ flex: 'none' }}
          >
            Change
          </Button>
        </Group>
      </Paper>

      <Box>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" mb="xs">
          Send the agreement
        </Text>
        <Stack gap="sm">
          {/* WhatsApp — the default when a phone exists. */}
          <Button
            color="green"
            variant={hasPhone ? 'filled' : 'default'}
            justify="space-between"
            fullWidth
            leftSection={<IconSend size={16} />}
            rightSection={hasPhone ? <Text size="xs">Recommended</Text> : null}
            disabled={!hasPhone}
            loading={sending}
            onClick={() => void onSend(['whatsapp'])}
          >
            {hasPhone
              ? `WhatsApp ${counterparty.phone}`
              : 'WhatsApp (no phone on file)'}
          </Button>

          {/* Email. */}
          <Button
            variant="default"
            justify="flex-start"
            fullWidth
            leftSection={<IconMail size={16} />}
            disabled={!hasEmail}
            loading={sending}
            onClick={() => void onSend(['email'])}
          >
            {hasEmail
              ? `Email ${counterparty.email}`
              : 'Email (no email on file)'}
          </Button>

          {/* Copy link — always available, but the link is only live after send
              activates the envelope. We send (copyLink channel) first if needed,
              then expose the URL to copy. */}
          {signingUrl != null && signingUrl !== '' ? (
            <CopyButton value={signingUrl}>
              {({ copied, copy }) => (
                <Button
                  variant="default"
                  justify="flex-start"
                  fullWidth
                  color={copied ? 'green' : undefined}
                  leftSection={
                    copied ? <IconCheck size={16} /> : <IconCopy size={16} />
                  }
                  onClick={copy}
                >
                  {copied ? 'Link copied' : 'Copy signing link'}
                </Button>
              )}
            </CopyButton>
          ) : (
            <Button
              variant="default"
              justify="flex-start"
              fullWidth
              leftSection={<IconLink size={16} />}
              loading={sending}
              onClick={() => void onSend(['copyLink'])}
            >
              Generate &amp; copy link
            </Button>
          )}
        </Stack>
      </Box>

      {(hasPhone || hasEmail) && !alreadySent ? (
        <Text size="xs" c="dimmed">
          {waText(counterparty.name)} the signing link is attached
          automatically.
        </Text>
      ) : null}

      {alreadySent ? (
        <Alert color="green" variant="light" icon={<IconCheck size={16} />}>
          Sent to the counterparty. We&rsquo;ll track their signature and
          deliver the signed PDF to both of you on completion.
        </Alert>
      ) : null}
    </Stack>
  );
};
