type ValidationEntry = {
  flatEntityMinimalInformation?: { universalIdentifier?: string };
  errors: { code: string; message: string; value?: string }[];
};

type ValidationExtensions = {
  code?: string;
  errors?: Record<string, ValidationEntry[]>;
  summary?: Record<string, number> & { totalErrors: number };
  message?: string;
};

export const formatInstallValidationErrors = (
  details: Record<string, unknown> | undefined,
): string[] => {
  if (!details || typeof details !== 'object') {
    return [];
  }

  const extensions = details as ValidationExtensions;

  if (!extensions.errors || !extensions.summary) {
    return [];
  }

  const lines: string[] = [];
  const totalErrors = extensions.summary.totalErrors;

  lines.push(
    `Validation failed with ${totalErrors} error${totalErrors !== 1 ? 's' : ''}:`,
  );

  for (const [metadataName, entries] of Object.entries(extensions.errors)) {
    const count = extensions.summary[metadataName] ?? entries.length;

    lines.push(`  ${metadataName}: ${count} error${count !== 1 ? 's' : ''}`);

    let errorIndex = 1;

    for (const entry of entries) {
      const universalIdentifier =
        entry.flatEntityMinimalInformation?.universalIdentifier;

      for (const entryError of entry.errors) {
        const details: string[] = [];

        if (entryError.value) {
          details.push(`value: ${entryError.value}`);
        }

        if (universalIdentifier) {
          details.push(`universalIdentifier: ${universalIdentifier}`);
        }

        const suffix = details.length > 0 ? ` (${details.join(', ')})` : '';

        lines.push(
          `    ${errorIndex}. ${entryError.code}: ${entryError.message}${suffix}`,
        );
        errorIndex++;
      }
    }
  }

  return lines;
};
