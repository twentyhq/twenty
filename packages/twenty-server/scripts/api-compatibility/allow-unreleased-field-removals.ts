import { type IntrospectionQuery, buildClientSchema } from 'graphql';

export const allowUnreleasedFieldRemovals = ({
  main,
  current,
  released,
}: {
  main: IntrospectionQuery;
  current: IntrospectionQuery;
  released: IntrospectionQuery;
}): IntrospectionQuery => {
  // Invalid baselines must fail closed instead of silently allowing removals.
  buildClientSchema(main);
  buildClientSchema(current);
  buildClientSchema(released);

  const releasedTypes = new Map(
    released.__schema.types.map((type) => [type.name, type]),
  );
  const currentTypes = new Map(
    current.__schema.types.map((type) => [type.name, type]),
  );

  return {
    ...main,
    __schema: {
      ...main.__schema,
      types: main.__schema.types.map((type) => {
        const releasedType = releasedTypes.get(type.name);
        const currentType = currentTypes.get(type.name);

        // Type removals and kind changes remain subject to the regular check.
        if (type.kind === 'OBJECT' && currentType?.kind === 'OBJECT') {
          return {
            ...type,
            fields: type.fields.filter(
              (field) =>
                currentType.fields.some((item) => item.name === field.name) ||
                (releasedType?.kind === 'OBJECT' &&
                  releasedType.fields.some((item) => item.name === field.name)),
            ),
          };
        }

        if (
          type.kind === 'INPUT_OBJECT' &&
          currentType?.kind === 'INPUT_OBJECT'
        ) {
          return {
            ...type,
            inputFields: type.inputFields.filter(
              (field) =>
                currentType.inputFields.some(
                  (item) => item.name === field.name,
                ) ||
                (releasedType?.kind === 'INPUT_OBJECT' &&
                  releasedType.inputFields.some(
                    (item) => item.name === field.name,
                  )),
            ),
          };
        }

        return type;
      }),
    },
  };
};
