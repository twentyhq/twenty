import { Badge, Box, Card, Divider, Group, Stack, Text } from '@mantine/core';
import { IconBuildingSkyscraper, IconMap } from 'twenty-ui/display';
import { type StudioPreview } from '@/propel/types/listingStudio';

// The live Property Finder preview pane (lane spec §6). Renders the PF-vocabulary
// projection the CRM /listing-studio/preview route builds from the current draft —
// so the agent sees exactly what we'd POST to PF, taking shape field-by-field as
// they fill the steps ("building as you go", spec §16). Empty preview → a quiet
// placeholder, never a broken card.
//
// S2 shows the proven, server-built preview fields (category/type/beds/baths/size/
// price/status/furnishing/location/title). The photo strip, AR copy, and the
// branded card chrome layer in once Photos (S5) and Write-up (S6) land.

const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

const fmtAed = (n: number): string =>
  `AED ${new Intl.NumberFormat('en-US').format(Math.round(n))}`;

const titleCase = (s: string): string =>
  s.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// One labeled spec line; renders nothing when its value is absent (build-as-you-go).
const PreviewRow = ({
  label,
  value,
}: {
  label: string;
  value: string | undefined;
}) => {
  if (value === undefined || value === '') return null;
  return (
    <Group justify="space-between" gap="sm" wrap="nowrap">
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" fw={500} ta="right" style={{ minWidth: 0 }}>
        {value}
      </Text>
    </Group>
  );
};

export const StudioPreviewPane = ({ preview }: { preview: StudioPreview }) => {
  const hasAnything = Object.values(preview).some((v) => v !== undefined);

  const headline =
    preview.title !== undefined && preview.title !== ''
      ? preview.title
      : 'Your listing preview';

  const bedsBaths = [
    preview.bedrooms !== undefined
      ? `${preview.bedrooms === 'studio' ? 'Studio' : `${preview.bedrooms} bed`}`
      : undefined,
    preview.bathrooms !== undefined && preview.bathrooms !== 'none'
      ? `${preview.bathrooms} bath`
      : undefined,
    preview.size !== undefined ? `${preview.size} sqft` : undefined,
  ]
    .filter((x): x is string => x !== undefined)
    .join(' · ');

  return (
    <Card
      withBorder
      radius="md"
      padding="md"
      style={{
        width: 320,
        flexShrink: 0,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 8,
      }}
    >
      <Group justify="space-between" mb="xs">
        <Group gap={6}>
          <IconBuildingSkyscraper size={15} />
          <Text size="xs" fw={600} tt="uppercase" c="dimmed">
            Property Finder preview
          </Text>
        </Group>
        {/* The PF watermark guarantee (spec §11 "stamped once, never twice"). */}
        <Badge size="xs" variant="light" color="gray">
          RE/MAX watermark
        </Badge>
      </Group>

      {/* Photo placeholder — a real cover lands in Photos (S5). */}
      <Box
        style={{
          height: 120,
          borderRadius: 8,
          marginBottom: 12,
          background:
            'repeating-linear-gradient(45deg, var(--mantine-color-default-border) 0, var(--mantine-color-default-border) 1px, transparent 1px, transparent 10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text size="xs" c="dimmed">
          Cover photo (added in Photos)
        </Text>
      </Box>

      <Stack
        gap={6}
        style={{
          opacity: hasAnything ? 1 : 0.6,
          transition: `opacity 180ms ${EASE_OUT}`,
        }}
      >
        <Text fw={600} size="sm" lineClamp={2}>
          {headline}
        </Text>

        {bedsBaths !== '' && (
          <Text size="xs" c="dimmed">
            {bedsBaths}
          </Text>
        )}

        {preview.locationLabel !== undefined && (
          <Group gap={4}>
            <IconMap size={12} />
            <Text size="xs" c="dimmed">
              {preview.locationLabel}
            </Text>
          </Group>
        )}

        {preview.priceAed !== undefined && (
          <Text fw={700} size="md" mt={2} c="red">
            {fmtAed(preview.priceAed)}
          </Text>
        )}

        <Divider my={6} />

        <PreviewRow
          label="Category"
          value={preview.category ? titleCase(preview.category) : undefined}
        />
        <PreviewRow
          label="Type"
          value={preview.type ? titleCase(preview.type) : undefined}
        />
        <PreviewRow
          label="Status"
          value={
            preview.projectStatus ? titleCase(preview.projectStatus) : undefined
          }
        />
        <PreviewRow
          label="Furnishing"
          value={
            preview.furnishingType
              ? titleCase(preview.furnishingType)
              : undefined
          }
        />

        {!hasAnything && (
          <Text size="xs" c="dimmed" ta="center" mt="xs">
            Fill in the details and the live preview builds here.
          </Text>
        )}
      </Stack>
    </Card>
  );
};
