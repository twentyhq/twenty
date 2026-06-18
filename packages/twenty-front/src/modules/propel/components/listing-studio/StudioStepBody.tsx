import {
  Box,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import {
  IconPhoto,
  IconId,
  IconFileText,
  IconRocket,
} from 'twenty-ui/display';
import { type StudioFacts, type StudioStep } from '@/propel/types/listingStudio';

// The per-step body. In S2 the SHELL is the deliverable, so most steps are honest
// stubs that state what lands in their slice (S3+). The exception is Details &
// price (step 2): it gets a real, basic facts form so the rail → draft → live PF
// preview loop is demonstrably working end-to-end this slice. The richer per-step
// surfaces (document drop + AI read, photo grid + watermark, EN/AR write-up, permit
// validation, publish/credits) replace these stubs in S3–S8.

// ── A stub panel: an icon, what the step will do, and the slice it lands in. ──
const StepStub = ({
  icon,
  title,
  lines,
  slice,
}: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  slice: string;
}) => (
  <Card withBorder radius="md" padding="xl">
    <Stack align="center" gap="sm" py="lg">
      <ThemeIcon variant="light" color="red" size={48} radius="xl">
        {icon}
      </ThemeIcon>
      <Text fw={600}>{title}</Text>
      <Stack gap={4} align="center">
        {lines.map((l) => (
          <Text key={l} size="sm" c="dimmed" ta="center">
            {l}
          </Text>
        ))}
      </Stack>
      <Text size="xs" c="dimmed" mt="xs" fs="italic">
        {slice}
      </Text>
    </Stack>
  </Card>
);

// ── Details & price — the one real form in S2. Edits flow up via onPatch, which
//    autosaves the draft and rebuilds the live PF preview. Kept basic (a handful
//    of the most preview-relevant fields); the full deed-extracted grid + source
//    badges + comps reality-check is S4. ──
const ASSET_CLASS = ['RESIDENTIAL', 'COMMERCIAL', 'LAND', 'INDUSTRIAL'];
const PROPERTY_TYPE = [
  'APARTMENT',
  'VILLA',
  'TOWNHOUSE',
  'PENTHOUSE',
  'STUDIO',
  'OFFICE',
  'SHOP',
  'RETAIL',
  'WAREHOUSE',
  'SHOWROOM',
  'PLOT',
];
const FURNISHING = ['FURNISHED', 'UNFURNISHED', 'PARTLY'];
const COMPLETION = ['READY', 'OFF_PLAN'];

const DetailsForm = ({
  facts,
  onPatch,
}: {
  facts: StudioFacts;
  onPatch: (patch: Partial<StudioFacts>) => void;
}) => (
  <Card withBorder radius="md" padding="lg">
    <Stack gap="md">
      <Box>
        <Text fw={600}>Details &amp; price</Text>
        <Text size="sm" c="dimmed">
          Confirm the facts. The live preview on the right updates as you type.
        </Text>
      </Box>

      <TextInput
        label="Listing title"
        placeholder="e.g. Spacious 2-Bedroom Apartment in Dubai Marina"
        value={facts.name ?? ''}
        onChange={(e) => onPatch({ name: e.currentTarget.value })}
      />

      <Group grow>
        <Select
          label="Asset class"
          data={ASSET_CLASS}
          value={facts.assetClass ?? null}
          onChange={(v) => onPatch({ assetClass: v ?? undefined })}
          comboboxProps={{ withinPortal: true }}
        />
        <Select
          label="Property type"
          data={PROPERTY_TYPE}
          value={facts.propertyType ?? null}
          onChange={(v) => onPatch({ propertyType: v ?? undefined })}
          comboboxProps={{ withinPortal: true }}
        />
      </Group>

      <TextInput
        label="Community"
        placeholder="e.g. Dubai Marina"
        value={facts.community ?? ''}
        onChange={(e) => onPatch({ community: e.currentTarget.value })}
      />

      <Group grow>
        <NumberInput
          label="Bedrooms"
          min={0}
          value={facts.bedrooms ?? ''}
          onChange={(v) =>
            onPatch({ bedrooms: typeof v === 'number' ? v : undefined })
          }
        />
        <NumberInput
          label="Bathrooms"
          min={0}
          step={0.5}
          value={facts.bathrooms ?? ''}
          onChange={(v) =>
            onPatch({ bathrooms: typeof v === 'number' ? v : undefined })
          }
        />
        <NumberInput
          label="Size (sqft)"
          min={0}
          value={facts.sizeSqft ?? ''}
          onChange={(v) =>
            onPatch({ sizeSqft: typeof v === 'number' ? v : undefined })
          }
        />
      </Group>

      <Group grow>
        <Select
          label="Furnishing"
          data={FURNISHING}
          value={facts.furnishing ?? null}
          onChange={(v) => onPatch({ furnishing: v ?? undefined })}
          comboboxProps={{ withinPortal: true }}
        />
        <Select
          label="Completion"
          data={COMPLETION}
          value={facts.completionStatus ?? null}
          onChange={(v) => onPatch({ completionStatus: v ?? undefined })}
          comboboxProps={{ withinPortal: true }}
        />
      </Group>

      <NumberInput
        label="Asking price (AED)"
        min={0}
        thousandSeparator=","
        value={facts.askingPriceAed ?? ''}
        onChange={(v) =>
          onPatch({ askingPriceAed: typeof v === 'number' ? v : undefined })
        }
      />
    </Stack>
  </Card>
);

export const StudioStepBody = ({
  step,
  facts,
  onPatch,
}: {
  step: StudioStep;
  facts: StudioFacts;
  onPatch: (patch: Partial<StudioFacts>) => void;
}) => {
  switch (step) {
    case 'intake':
      return (
        <StepStub
          icon={<IconFileText size={26} />}
          title="Intake the mandate"
          lines={[
            'Drop the title deed (or Oqood / SPA), Form A, and unit photos.',
            'We read them and pre-fill the facts.',
          ]}
          slice="Document upload + AI extract — slice S3."
        />
      );
    case 'details':
      return <DetailsForm facts={facts} onPatch={onPatch} />;
    case 'photos':
      return (
        <StepStub
          icon={<IconPhoto size={26} />}
          title="Photos"
          lines={[
            'Order and cover-pick the unit photos.',
            'Apply the RE/MAX watermark — never double-stamped.',
          ]}
          slice="Watermark + host + PF spec check — slice S5."
        />
      );
    case 'writeup':
      return (
        <StepStub
          icon={<IconFileText size={26} />}
          title="Write-up"
          lines={[
            'Generate EN + AR copy in your chosen tone.',
            'Compliance-lint strips anything Property Finder rejects.',
          ]}
          slice="AI generation + tone + lint — slice S6."
        />
      );
    case 'permit':
      return (
        <StepStub
          icon={<IconId size={26} />}
          title="Permit"
          lines={[
            'Enter the Trakheesi permit you obtained from DLD.',
            'We validate it against the property and expiry.',
          ]}
          slice="Capture + validation + attestation — slice S7."
        />
      );
    case 'publish':
      return (
        <StepStub
          icon={<IconRocket size={26} />}
          title="Publish"
          lines={[
            'Check eligibility and the credit cost.',
            'Go live on Property Finder.',
          ]}
          slice="Eligibility + credits + publish — slice S8."
        />
      );
    default:
      return null;
  }
};
