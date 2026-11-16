type Selection = { [field: string]: true | Selection };

type PickSelectedFieldsArgs = {
  record: Record<string, unknown>;
  selection: Selection;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

// Mirrors the API, which only returns the fields a query selects.
export const pickSelectedFields = ({
  record,
  selection,
}: PickSelectedFieldsArgs): Record<string, unknown> =>
  Object.fromEntries(
    Object.entries(selection)
      .filter(([field]) => field in record)
      .map(([field, subSelection]) => {
        const value = record[field];

        return [
          field,
          subSelection !== true && isRecord(value)
            ? pickSelectedFields({ record: value, selection: subSelection })
            : value,
        ];
      }),
  );
