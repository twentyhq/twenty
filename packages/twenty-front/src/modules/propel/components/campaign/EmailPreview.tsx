import { Box, Text } from '@mantine/core';
import { useMemo } from 'react';
import {
  type MergeValues,
  parseTemplate,
  renderEmail,
} from '@/propel/lib/campaignRenderer';

// LIVE branded-email preview. Unlike the front-component sandbox (which forbade
// innerHTML and could only render a div/span approximation), the graduated page
// runs in the real DOM, so we render the EXACT branded HTML the server drain
// produces — via the ported renderEmail() — inside a sandboxed iframe srcDoc.
// The iframe isolates the email's inline styles/tables from the CRM page and is
// `sandbox`ed (no scripts, no same-origin) so the previewed HTML cannot touch
// the app. This is the real thing: what the recipient sees, minus delivery.
export const EmailPreview = ({
  subject,
  body,
  language,
  values,
  permitNumber,
}: {
  subject: string;
  body: string;
  language: 'EN' | 'AR';
  values: MergeValues;
  permitNumber?: string;
}) => {
  const rendered = useMemo(
    () =>
      renderEmail({
        parsedSubject: parseTemplate(subject),
        parsedBody: parseTemplate(body),
        values,
        language,
        brokerageName: 'RE/MAX Hub',
        permitNumber,
        // Preview-only placeholder; the real per-recipient signed URL is built
        // at send time. Shown so the footer/unsubscribe link renders faithfully.
        unsubscribeUrl: 'https://crm.remaxhub.ae/unsubscribe',
      }),
    [subject, body, language, values, permitNumber],
  );

  return (
    <Box
      style={{
        border: '1px solid var(--mantine-color-default-border)',
        borderRadius: 'var(--mantine-radius-md)',
        overflow: 'hidden',
        background: 'var(--mantine-color-body)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Box
        px="sm"
        py={8}
        style={{
          borderBottom: '1px solid var(--mantine-color-default-border)',
          background: 'var(--mantine-color-body)',
        }}
      >
        <Text size="xs" c="dimmed" fw={600} tt="uppercase">
          Subject
        </Text>
        <Text size="sm" c="var(--mantine-color-text)" fw={600} lineClamp={2}>
          {rendered.subject || 'Your subject line'}
        </Text>
      </Box>
      <iframe
        title="Email preview"
        // The previewed HTML is our own escape-first renderer output, but we
        // still drop scripts/same-origin so an authored link or merge value can
        // never execute or read the app.
        sandbox=""
        srcDoc={rendered.html}
        style={{
          width: '100%',
          height: 460,
          border: 'none',
          background: '#f4f4f5',
        }}
      />
    </Box>
  );
};
