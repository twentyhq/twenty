type Selection = { [field: string]: true | Selection };

// Mirrors the API, which only returns the fields a query selects.
export const pickSelectedFields = (
  record: Record<string, unknown>,
  selection: Selection,
): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(selection)
      .filter(([field]) => field in record)
      .map(([field, subSelection]) => {
        const value = record[field];

        return [
          field,
          subSelection === true || value === null || typeof value !== 'object'
            ? value
            : pickSelectedFields(
                value as Record<string, unknown>,
                subSelection,
              ),
        ];
      }),
  );
