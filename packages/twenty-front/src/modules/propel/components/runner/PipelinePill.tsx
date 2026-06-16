import { Badge } from '@mantine/core';
import { pipeOf } from '@/propel/lib/oneOnOneConfig';

// Colour-coded pipeline tag (RCBI / Secondary / Sell / …). The in-sandbox version
// hand-rolled an oklch chip; here a Mantine Badge gives the same read with the
// kit's borders/typography. Hue comes from the shared PIPELINE map. Renders
// nothing for an unknown / absent pipeline (never a stray empty badge).
export const PipelinePill = ({
  type,
  small,
}: {
  type?: string | null;
  small?: boolean;
}) => {
  const p = pipeOf(type);
  if (p === null) return null;
  const col = `oklch(0.66 0.15 ${p.hue})`;
  return (
    <Badge
      size={small === true ? 'xs' : 'sm'}
      radius="sm"
      variant="light"
      styles={{
        root: {
          color: col,
          background: `color-mix(in oklch, ${col} 16%, transparent)`,
          border: `1px solid color-mix(in oklch, ${col} 30%, transparent)`,
          flex: 'none',
        },
      }}
    >
      {p.label}
    </Badge>
  );
};
