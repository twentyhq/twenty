import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from '@mantine/core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  IconAlertCircle,
  IconPencil,
  IconSend,
  IconSparkles,
} from 'twenty-ui/display';
import { callPropelRoute } from '@/propel/lib/callPropelRoute';
import { aiText, envelopeMessage } from '@/propel/lib/campaignBuilderConfig';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  type AiBuildResponse,
  type AiChatMessage,
  type AiPlan,
  type AiTruth,
} from '@/propel/types/campaignBuilder';

// The conversational AI builder. A real scrollable transcript (the sandbox
// fought the host for scroll), a controlled Textarea that CLEARS on send and
// sends on Enter (Shift+Enter = newline), and a verified plan card built from
// the server's TRUTH PASS (real segment count / cap / permit / template), never
// the LLM's own claims. "Open in manual editor" hands the proposal off.
export const AiBuilderPanel = ({
  onHandoff,
}: {
  onHandoff: (plan: AiPlan) => void;
}) => {
  const notify = usePropelToast();
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [convId, setConvId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [plan, setPlan] = useState<AiPlan | null>(null);
  const [truth, setTruth] = useState<AiTruth | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  // Pin the transcript to the bottom as it grows.
  useEffect(() => {
    const el = viewportRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, sending]);

  const send = useCallback(async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput(''); // clears immediately on send (Enter-to-send UX)
    setSending(true);
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    try {
      const res = await callPropelRoute<AiBuildResponse>('/marketing/ai-build', {
        message: msg,
        ...(convId ? { conversationId: convId } : {}),
      });
      if (!res || res.error) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: envelopeMessage(
              res,
              'Something went wrong — try rephrasing.',
            ),
          },
        ]);
        return;
      }
      if (res.conversationId) setConvId(res.conversationId);
      const question = aiText(res.question);
      const thinking = aiText(res.thinking);
      if (question) {
        // AI needs more info → show the question, clear any stale proposal.
        setMessages((prev) => [...prev, { role: 'assistant', content: question }]);
        setPlan(null);
        setTruth(null);
      } else if (res.plan) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: thinking
              ? `${thinking} — see the proposed campaign on the right.`
              : 'Here is my proposed campaign.',
          },
        ]);
        setPlan(res.plan);
        setTruth(res.truth ?? null);
      } else if (thinking) {
        setMessages((prev) => [...prev, { role: 'assistant', content: thinking }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Something went wrong — try again.' },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, convId]);

  const handoff = useCallback(() => {
    if (!plan) return;
    notify('Opened the proposal in the manual editor — review before sending.', 'info');
    onHandoff(plan);
  }, [plan, notify, onHandoff]);

  const planChannel =
    plan?.channel === 'WHATSAPP' ? 'WhatsApp' : plan ? 'Email' : '';

  return (
    <Group align="stretch" gap="md" wrap="nowrap" style={{ minHeight: 0, flex: 1 }}>
      {/* Chat column */}
      <Card
        withBorder
        radius="md"
        padding="sm"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--mantine-color-body)',
        }}
      >
        <ScrollArea
          viewportRef={viewportRef}
          style={{ flex: 1, minHeight: 320 }}
          type="auto"
        >
          <Stack gap="sm" p={4}>
            {messages.length === 0 && (
              <Stack gap={6} align="center" py="xl">
                <IconSparkles
                  size={28}
                  style={{ color: 'var(--mantine-color-red-6)' }}
                />
                <Text size="sm" fw={600} c="var(--mantine-color-text)">
                  Describe the campaign you want
                </Text>
                <Text size="xs" c="dimmed" ta="center" maw={360}>
                  e.g. &ldquo;Re-engage cold Marina leads who haven&rsquo;t heard
                  from us in 90 days with a short check-in email.&rdquo; I&rsquo;ll
                  propose a full campaign with verified numbers.
                </Text>
              </Stack>
            )}
            {messages.map((m, idx) => (
              <Group
                key={idx}
                justify={m.role === 'user' ? 'flex-end' : 'flex-start'}
              >
                <Box
                  style={{
                    maxWidth: '85%',
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    background:
                      m.role === 'user'
                        ? 'var(--mantine-color-red-6)'
                        : 'var(--mantine-color-default-hover)',
                    color:
                      m.role === 'user' ? '#fff' : 'var(--mantine-color-text)',
                  }}
                >
                  {m.content}
                </Box>
              </Group>
            ))}
            {sending && (
              <Group justify="flex-start">
                <Box
                  style={{
                    padding: '8px 12px',
                    borderRadius: 12,
                    fontSize: 13,
                    background: 'var(--mantine-color-default-hover)',
                    color: 'var(--mantine-color-dimmed)',
                  }}
                >
                  Thinking…
                </Box>
              </Group>
            )}
          </Stack>
        </ScrollArea>
        <Group gap="xs" mt="sm" align="flex-end" wrap="nowrap">
          <Textarea
            autosize
            minRows={1}
            maxRows={4}
            style={{ flex: 1 }}
            placeholder="Describe your campaign…"
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
          />
          <ActionIcon
            size="lg"
            color="red"
            variant="filled"
            aria-label="Send"
            disabled={input.trim() === '' || sending}
            onClick={() => void send()}
          >
            <IconSend size={18} />
          </ActionIcon>
        </Group>
      </Card>

      {/* Plan column */}
      <Card
        withBorder
        radius="md"
        padding="md"
        style={{
          width: 340,
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--mantine-color-body)',
        }}
      >
        <Text fw={700} size="sm" mb="xs" c="var(--mantine-color-text)">
          Proposed campaign
        </Text>
        {!plan ? (
          <Text size="xs" c="dimmed">
            The verified plan appears here once the AI has enough to propose one.
            Numbers are checked against your real data before they&rsquo;re shown.
          </Text>
        ) : (
          <Stack gap={8} style={{ minHeight: 0 }}>
            <Group gap="xs">
              <Badge color={planChannel === 'WhatsApp' ? 'teal' : 'blue'} variant="light">
                {planChannel}
              </Badge>
              <Badge color="gray" variant="light">
                {plan.language === 'AR' ? 'Arabic' : 'English'}
              </Badge>
            </Group>
            <PlanRow label="Audience">
              {plan.segmentDescription || '—'}
            </PlanRow>
            {truth?.segmentCount != null && (
              <PlanRow label="Verified reach">
                {truth.segmentCount.toLocaleString('en-US')}
                {truth.capExcludedEstimate > 0
                  ? ` (${truth.capExcludedEstimate} held by caps)`
                  : ''}
              </PlanRow>
            )}
            {plan.subject && <PlanRow label="Subject">{plan.subject}</PlanRow>}
            {plan.scheduledAt && (
              <PlanRow label="Scheduled">{plan.scheduledAt}</PlanRow>
            )}
            {truth?.permitWarning && (
              <Group gap={6} align="flex-start" wrap="nowrap">
                <IconAlertCircle
                  size={14}
                  style={{ color: 'var(--mantine-color-yellow-7)', flex: 'none', marginTop: 2 }}
                />
                <Text size="xs" c="var(--mantine-color-yellow-7)">
                  {truth.permitWarning}
                </Text>
              </Group>
            )}
            {truth?.templateWarning && (
              <Group gap={6} align="flex-start" wrap="nowrap">
                <IconAlertCircle
                  size={14}
                  style={{ color: 'var(--mantine-color-yellow-7)', flex: 'none', marginTop: 2 }}
                />
                <Text size="xs" c="var(--mantine-color-yellow-7)">
                  {truth.templateWarning}
                </Text>
              </Group>
            )}
            <Button
              mt="xs"
              variant="light"
              color="red"
              leftSection={<IconPencil size={16} />}
              onClick={handoff}
            >
              Open in manual editor
            </Button>
            <Text size="xs" c="dimmed">
              You&rsquo;ll review every field before anything sends.
            </Text>
          </Stack>
        )}
      </Card>
    </Group>
  );
};

const PlanRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <Box>
    <Text size="xs" c="dimmed" fw={600} tt="uppercase">
      {label}
    </Text>
    <Text size="sm" c="var(--mantine-color-text)" style={{ wordBreak: 'break-word' }}>
      {children}
    </Text>
  </Box>
);
