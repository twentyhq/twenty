import {
  Alert,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Select,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { useCallback, useEffect, useState } from 'react';
import {
  IconArrowRight,
  IconBuildingSkyscraper,
  IconFileText,
  IconHistory,
} from 'twenty-ui/display';
import { STUDIO_STEP_META } from '@/propel/lib/listingStudioConfig';
import { loadStudioProperties } from '@/propel/lib/listingStudioCrm';
import {
  type StudioDraft,
  type StudioPropertyOption,
} from '@/propel/types/listingStudio';

// The launcher / entry screen (lane spec §4 item 1). Two entry points:
//   A — New from documents (blank draft).
//   B — From a CRM owner/property (a searchable property picker → prefill).
// Plus, if a local draft exists, a "Resume" card (spec §4 item 11).
//
// Choosing an entry hands back up to the page, which opens the Studio shell.

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

const EntryCard = ({
  icon,
  title,
  body,
  cta,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <Card
    withBorder
    radius="md"
    padding="lg"
    style={{
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.6 : 1,
      transition: `transform 160ms ${EASE_OUT}, border-color 160ms ${EASE_OUT}`,
    }}
    onClick={disabled ? undefined : onClick}
  >
    <Stack gap="sm" h="100%">
      <Group gap="xs">
        <Box c="red">{icon}</Box>
        <Text fw={600}>{title}</Text>
      </Group>
      <Text size="sm" c="dimmed" style={{ flex: 1 }}>
        {body}
      </Text>
      <Button
        variant="light"
        color="red"
        rightSection={<IconArrowRight size={14} />}
        onClick={onClick}
        disabled={disabled}
      >
        {cta}
      </Button>
    </Stack>
  </Card>
);

export const StudioLauncher = ({
  resumable,
  starting,
  onStartScratch,
  onStartFromProperty,
  onResume,
}: {
  resumable: StudioDraft | null;
  starting: boolean;
  onStartScratch: () => void;
  onStartFromProperty: (propertyId: string) => void;
  onResume: (draft: StudioDraft) => void;
}) => {
  const [pickingProperty, setPickingProperty] = useState(false);
  const [properties, setProperties] = useState<StudioPropertyOption[]>([]);
  const [loadingProps, setLoadingProps] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchProperties = useCallback(async () => {
    setLoadingProps(true);
    const rows = await loadStudioProperties();
    setProperties(rows);
    setLoadingProps(false);
  }, []);

  useEffect(() => {
    if (pickingProperty && properties.length === 0) {
      void fetchProperties();
    }
  }, [pickingProperty, properties.length, fetchProperties]);

  const propertySelectData = properties.map((p) => ({
    value: p.id,
    label:
      p.name +
      (p.community ? ` — ${p.community}` : '') +
      (typeof p.bedrooms === 'number' ? ` (${p.bedrooms} bed)` : ''),
  }));

  return (
    <Stack gap="lg" maw={760} mx="auto" w="100%" mt="md">
      {resumable !== null && (
        <Alert
          variant="light"
          color="red"
          icon={<IconHistory size={16} />}
          title="Resume your draft"
        >
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm">
              You have an unfinished listing on the{' '}
              <strong>
                {STUDIO_STEP_META.find((m) => m.id === resumable.step)?.label ??
                  resumable.step}
              </strong>{' '}
              step.
            </Text>
            <Button
              size="xs"
              color="red"
              onClick={() => onResume(resumable)}
              style={{ flexShrink: 0 }}
            >
              Resume
            </Button>
          </Group>
        </Alert>
      )}

      <Box>
        <Text fw={600} size="lg">
          New listing
        </Text>
        <Text size="sm" c="dimmed">
          Build a polished Property Finder listing from the owner&apos;s mandate.
        </Text>
      </Box>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        <EntryCard
          icon={<IconFileText size={20} />}
          title="From documents"
          body="Drop the title deed (or Oqood / SPA), Form A, and unit photos. We read them and build the listing."
          cta="Start from scratch"
          onClick={onStartScratch}
          disabled={starting}
        />
        <EntryCard
          icon={<IconBuildingSkyscraper size={20} />}
          title="From a CRM property"
          body="Start from an owner or property already in the CRM — its facts pre-fill, then add the mandate docs and photos."
          cta="Pick a property"
          onClick={() => setPickingProperty(true)}
          disabled={starting}
        />
      </SimpleGrid>

      {pickingProperty && (
        <Card withBorder radius="md" padding="md">
          <Stack gap="sm">
            <Text fw={600} size="sm">
              Start from which property?
            </Text>
            {loadingProps ? (
              <Group gap="xs">
                <Loader size="xs" color="red" />
                <Text size="sm" c="dimmed">
                  Loading your properties…
                </Text>
              </Group>
            ) : properties.length === 0 ? (
              <Text size="sm" c="dimmed">
                No properties found in the CRM yet — use “From documents” instead.
              </Text>
            ) : (
              <Group align="flex-end" gap="sm" wrap="nowrap">
                <Select
                  flex={1}
                  placeholder="Search properties…"
                  searchable
                  data={propertySelectData}
                  value={selectedId}
                  onChange={setSelectedId}
                  nothingFoundMessage="No match"
                  comboboxProps={{ withinPortal: true }}
                />
                <Button
                  color="red"
                  disabled={selectedId === null || starting}
                  loading={starting}
                  onClick={() => {
                    if (selectedId !== null) onStartFromProperty(selectedId);
                  }}
                  rightSection={<IconArrowRight size={14} />}
                >
                  Continue
                </Button>
              </Group>
            )}
          </Stack>
        </Card>
      )}
    </Stack>
  );
};
