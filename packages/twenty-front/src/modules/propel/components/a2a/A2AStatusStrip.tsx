import { Anchor, Box, Group, Text } from '@mantine/core';
import {
  IconClock,
  IconDownload,
  IconExternalLink,
  IconFilePencil,
  IconFileText,
  IconSquareRoundedCheck,
} from 'twenty-ui/display';
import { type A2ADocumentStatus } from '@/propel/types/a2a';

// The status strip (design §5 A2AStatusStrip): draft → out-for-signature → signed,
// with the final PDF + audit links once signed. Reads the agreementDocument status
// the hook polls (webhook-driven on the backend). Purely presentational.

type StageKey = 'DRAFT' | 'OUT_FOR_SIGNATURE' | 'SIGNED';

const STAGES: { key: StageKey; label: string; Icon: typeof IconFileText }[] = [
  { key: 'DRAFT', label: 'Draft', Icon: IconFileText },
  {
    key: 'OUT_FOR_SIGNATURE',
    label: 'Out for signature',
    Icon: IconFilePencil,
  },
  { key: 'SIGNED', label: 'Signed', Icon: IconSquareRoundedCheck },
];

const stageIndex = (status: A2ADocumentStatus | null): number => {
  switch (status) {
    case 'SIGNED':
      return 2;
    case 'OUT_FOR_SIGNATURE':
      return 1;
    case 'DRAFT':
      return 0;
    default:
      return -1;
  }
};

export const A2AStatusStrip = ({
  status,
  signedPdfUrl,
  auditUrl,
}: {
  status: A2ADocumentStatus | null;
  signedPdfUrl: string | null;
  auditUrl: string | null;
}) => {
  const active = stageIndex(status);
  const voided = status === 'VOIDED';

  return (
    <Box
      p="md"
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        background: 'var(--mantine-color-body)',
      }}
    >
      <Group gap={0} wrap="nowrap" align="center">
        {STAGES.map((stage, i) => {
          const reached = active >= i && !voided;
          const isCurrent = active === i && !voided;
          const Icon = stage.Icon;
          return (
            <Group key={stage.key} gap={0} wrap="nowrap" style={{ flex: 1 }}>
              <Group gap={8} wrap="nowrap" style={{ flex: 'none' }}>
                <Box
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: reached
                      ? 'var(--mantine-color-white)'
                      : 'var(--mantine-color-dimmed)',
                    background: reached
                      ? 'var(--mantine-color-red-6)'
                      : 'transparent',
                    border: reached
                      ? 'none'
                      : '1px solid var(--mantine-color-default-border)',
                    flex: 'none',
                  }}
                >
                  {isCurrent && stage.key === 'OUT_FOR_SIGNATURE' ? (
                    <IconClock size={15} />
                  ) : (
                    <Icon size={15} />
                  )}
                </Box>
                <Text
                  size="sm"
                  fw={isCurrent ? 700 : 500}
                  c={reached ? undefined : 'dimmed'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  {stage.label}
                </Text>
              </Group>
              {i < STAGES.length - 1 ? (
                <Box
                  style={{
                    flex: 1,
                    height: 2,
                    margin: '0 12px',
                    background:
                      active > i && !voided
                        ? 'var(--mantine-color-red-6)'
                        : 'var(--mantine-color-default-border)',
                  }}
                />
              ) : null}
            </Group>
          );
        })}
      </Group>

      {voided ? (
        <Text size="sm" c="red" mt="sm">
          This agreement was voided.
        </Text>
      ) : null}

      {status === 'SIGNED' && (signedPdfUrl != null || auditUrl != null) ? (
        <Group gap="lg" mt="md">
          {signedPdfUrl != null && signedPdfUrl !== '' ? (
            <Anchor
              href={signedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
            >
              <Group gap={6} wrap="nowrap">
                <IconDownload size={14} /> Signed PDF
              </Group>
            </Anchor>
          ) : null}
          {auditUrl != null && auditUrl !== '' ? (
            <Anchor
              href={auditUrl}
              target="_blank"
              rel="noopener noreferrer"
              size="sm"
              c="dimmed"
            >
              <Group gap={6} wrap="nowrap">
                <IconExternalLink size={14} /> Audit trail
              </Group>
            </Anchor>
          ) : null}
        </Group>
      ) : null}
    </Box>
  );
};
