import {
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  NavLink,
  ScrollArea,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useState } from 'react';
import { IconSearch, IconUser, IconUserPlus } from 'twenty-ui/display';
import { usePropelToast } from '@/propel/hooks/usePropelToast';
import {
  type CounterpartyDraft,
  type CounterpartyPerson,
} from '@/propel/types/a2a';

// Inline drawer to capture/link the counterparty Person (design §5 ContactRunner;
// modeled on the 1:1 RunnerDrawer). Two modes: LINK an existing Person (search the
// CRM) or CREATE a new one (name / email / PHONE / brokerage). On save it hands the
// resolved CounterpartyPerson back to the hook, which links it onto the
// agreementDocument's `counterpartyPerson` relation (when a draft exists) and lets
// the SendPanel light its channels. PHONE matters: it drives the WhatsApp-first
// delivery wired in doc-service.

type Mode = 'link' | 'create';

const EMPTY_DRAFT: CounterpartyDraft = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  brokerage: '',
};

export const ContactRunner = ({
  opened,
  onClose,
  onSearch,
  onLink,
  onCreate,
}: {
  opened: boolean;
  onClose: () => void;
  onSearch: (term: string) => Promise<CounterpartyPerson[]>;
  onLink: (person: CounterpartyPerson) => Promise<boolean>;
  onCreate: (draft: CounterpartyDraft) => Promise<boolean>;
}) => {
  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size="min(560px, 92vw)"
      title="Counterparty broker"
      padding={0}
      styles={{
        body: { height: 'calc(100% - 60px)', padding: 0 },
        content: { display: 'flex', flexDirection: 'column' },
      }}
    >
      {opened ? (
        <ContactBody
          onClose={onClose}
          onSearch={onSearch}
          onLink={onLink}
          onCreate={onCreate}
        />
      ) : null}
    </Drawer>
  );
};

const ContactBody = ({
  onClose,
  onSearch,
  onLink,
  onCreate,
}: {
  onClose: () => void;
  onSearch: (term: string) => Promise<CounterpartyPerson[]>;
  onLink: (person: CounterpartyPerson) => Promise<boolean>;
  onCreate: (draft: CounterpartyDraft) => Promise<boolean>;
}) => {
  const notify = usePropelToast();
  const [mode, setMode] = useState<Mode>('link');

  // LINK state
  const [term, setTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<CounterpartyPerson[]>([]);
  const [linkingId, setLinkingId] = useState<string | null>(null);

  // CREATE state
  const [draft, setDraft] = useState<CounterpartyDraft>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);

  const runSearch = async () => {
    if (term.trim().length < 2) return;
    setSearching(true);
    try {
      setResults(await onSearch(term));
    } finally {
      setSearching(false);
    }
  };

  const handleLink = async (person: CounterpartyPerson) => {
    setLinkingId(person.id);
    try {
      const ok = await onLink(person);
      if (ok) {
        notify(`Linked ${person.name} as the counterparty.`, 'success');
        onClose();
      } else {
        notify('Could not link that contact.', 'error');
      }
    } finally {
      setLinkingId(null);
    }
  };

  const canCreate =
    draft.firstName.trim() !== '' &&
    (draft.email.trim() !== '' || draft.phone.trim() !== '');

  const handleCreate = async () => {
    if (!canCreate) return;
    setCreating(true);
    try {
      const ok = await onCreate(draft);
      if (ok) {
        notify('Counterparty created and linked.', 'success');
        onClose();
      } else {
        notify('Could not create that contact.', 'error');
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box
      style={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box p="md">
        <SegmentedControl
          fullWidth
          color="red"
          value={mode}
          onChange={(v) => setMode(v as Mode)}
          data={[
            { value: 'link', label: 'Link existing' },
            { value: 'create', label: 'New contact' },
          ]}
        />
      </Box>
      <Divider />

      {mode === 'link' ? (
        <Box
          style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box p="md">
            <Group gap="sm" wrap="nowrap" align="flex-end">
              <TextInput
                style={{ flex: 1 }}
                label="Search people"
                placeholder="Name or email"
                value={term}
                onChange={(e) => setTerm(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void runSearch();
                }}
              />
              <Button
                variant="default"
                leftSection={<IconSearch size={14} />}
                onClick={() => void runSearch()}
                loading={searching}
              >
                Search
              </Button>
            </Group>
          </Box>
          <ScrollArea style={{ flex: 1 }}>
            {searching ? (
              <Group justify="center" p="xl">
                <Loader color="red" size="sm" />
              </Group>
            ) : results.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" p="xl">
                {term.trim().length >= 2
                  ? 'No matches — try "New contact".'
                  : 'Search for the other broker by name or email.'}
              </Text>
            ) : (
              <Box pb="md">
                {results.map((p) => (
                  <NavLink
                    key={p.id}
                    color="red"
                    variant="light"
                    leftSection={<IconUser size={16} />}
                    disabled={linkingId !== null}
                    onClick={() => void handleLink(p)}
                    label={
                      <Text size="sm" fw={600} truncate>
                        {p.name}
                      </Text>
                    }
                    description={
                      [p.brokerage, p.email, p.phone]
                        .filter((v) => v != null && v !== '')
                        .join(' · ') || 'No channels on file'
                    }
                    rightSection={
                      linkingId === p.id ? (
                        <Loader size="xs" color="red" />
                      ) : null
                    }
                  />
                ))}
              </Box>
            )}
          </ScrollArea>
        </Box>
      ) : (
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="md" p="md">
            <Group grow align="flex-start">
              <TextInput
                label="First name"
                withAsterisk
                value={draft.firstName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, firstName: e.currentTarget.value }))
                }
              />
              <TextInput
                label="Last name"
                value={draft.lastName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, lastName: e.currentTarget.value }))
                }
              />
            </Group>
            <TextInput
              label="Email"
              type="email"
              placeholder="broker@brokerage.ae"
              value={draft.email}
              onChange={(e) =>
                setDraft((d) => ({ ...d, email: e.currentTarget.value }))
              }
            />
            <TextInput
              label="Phone"
              placeholder="+971 50 123 4567"
              description="Used for the WhatsApp send to the counterparty."
              value={draft.phone}
              onChange={(e) =>
                setDraft((d) => ({ ...d, phone: e.currentTarget.value }))
              }
            />
            <TextInput
              label="Brokerage"
              placeholder="Their agency"
              value={draft.brokerage}
              onChange={(e) =>
                setDraft((d) => ({ ...d, brokerage: e.currentTarget.value }))
              }
            />
            <Text size="xs" c="dimmed">
              Add an email or a phone so we have a channel to send the agreement
              on.
            </Text>
          </Stack>
        </ScrollArea>
      )}

      <Divider />
      <Group justify="flex-end" p="md">
        <Button variant="subtle" color="gray" onClick={onClose}>
          Cancel
        </Button>
        {mode === 'create' ? (
          <Button
            color="red"
            leftSection={<IconUserPlus size={14} />}
            disabled={!canCreate}
            loading={creating}
            onClick={() => void handleCreate()}
          >
            Create &amp; link
          </Button>
        ) : null}
      </Group>
    </Box>
  );
};
