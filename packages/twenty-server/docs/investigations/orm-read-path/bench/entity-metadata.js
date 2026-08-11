require('reflect-metadata');
const { DataSource, EntitySchema } = require('typeorm');
const { EntitySchemaTransformer } = require('typeorm/entity-schema/EntitySchemaTransformer');
const { EntityMetadataBuilder } = require('typeorm/metadata-builder/EntityMetadataBuilder');

// Mirrors EntitySchemaFactory: one EntitySchema per object metadata row,
// flat columns (composites already expanded), relations for RELATION fields.
const buildSchemas = ({ objectCount, columnsPerObject, relationsPerObject }) => {
  const names = Array.from({ length: objectCount }, (_, i) => `object${i}`);

  return names.map((name, index) => {
    const columns = {
      id: { name: 'id', type: 'uuid', primary: true, nullable: false },
      createdAt: { name: 'createdAt', type: 'timestamptz', precision: 3, createDate: true, nullable: false },
      updatedAt: { name: 'updatedAt', type: 'timestamptz', precision: 3, updateDate: true, nullable: false },
      deletedAt: { name: 'deletedAt', type: 'timestamptz', precision: 3, deleteDate: true, nullable: true },
    };

    for (let c = 0; c < columnsPerObject; c++) {
      columns[`object${index}Field${c}`] = { name: `object${index}Field${c}`, type: 'text', nullable: true };
    }

    const relations = {};

    for (let r = 0; r < relationsPerObject; r++) {
      const targetName = names[(index + r + 1) % objectCount];
      const relationName = `relation${r}`;

      columns[`${relationName}Id`] = { name: `${relationName}Id`, type: 'uuid', nullable: true };
      relations[relationName] = {
        type: 'many-to-one',
        target: targetName,
        inverseSide: `inverseOf${name}${r}`,
        joinColumn: { name: `${relationName}Id` },
      };
      relations[`inverseOf${targetName}${r}`] = undefined;
    }

    for (const key of Object.keys(relations)) {
      if (relations[key] === undefined) delete relations[key];
    }

    return new EntitySchema({
      name,
      tableName: `_${name}`,
      schema: 'workspace_1wgvd1injqtife6y4rvfbu3h5',
      columns,
      relations,
    });
  });
};

const countObjects = (roots, skipKeys) => {
  const seen = new Set();
  const strings = new Set();
  const stack = [...roots];
  let objects = 0;
  let arrays = 0;
  let maps = 0;
  let functions = 0;

  while (stack.length > 0) {
    const value = stack.pop();

    if (typeof value === 'string') {
      strings.add(value);
      continue;
    }
    if (typeof value === 'function') {
      if (seen.has(value)) continue;
      seen.add(value);
      functions++;
      continue;
    }
    if (value === null || typeof value !== 'object') continue;
    if (seen.has(value)) continue;
    seen.add(value);

    if (Array.isArray(value)) {
      arrays++;
      for (const item of value) stack.push(item);
      continue;
    }

    if (value instanceof Map || value instanceof Set) {
      maps++;
      for (const item of value.values()) stack.push(item);
      continue;
    }

    objects++;

    for (const key of Object.keys(value)) {
      if (skipKeys.has(key)) continue;
      let child;
      try {
        child = value[key];
      } catch {
        continue;
      }
      stack.push(child);
    }
  }

  return {
    objects,
    arrays,
    maps,
    functions,
    distinctStrings: strings.size,
    total: objects + arrays + maps + functions + strings.size,
  };
};

const run = async ({ label, objectCount, columnsPerObject, relationsPerObject, repeats }) => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'x',
    password: 'x',
    database: 'x',
    entities: [],
  });

  const schemas = buildSchemas({ objectCount, columnsPerObject, relationsPerObject });

  let metadatas;
  const timings = [];

  for (let i = 0; i < repeats; i++) {
    const start = process.hrtime.bigint();
    const storage = new EntitySchemaTransformer().transform(schemas);
    metadatas = new EntityMetadataBuilder(dataSource, storage).build();
    timings.push(Number(process.hrtime.bigint() - start) / 1e6);
  }

  timings.sort((a, b) => a - b);

  const counted = countObjects(metadatas, new Set(['connection']));
  const columnCount = metadatas.reduce((acc, m) => acc + m.columns.length, 0);
  const relationCount = metadatas.reduce((acc, m) => acc + m.relations.length, 0);

  console.log(
    JSON.stringify(
      {
        label,
        objects: metadatas.length,
        columns: columnCount,
        relations: relationCount,
        buildMsMedian: Number(timings[Math.floor(timings.length / 2)].toFixed(2)),
        buildMsMin: Number(timings[0].toFixed(2)),
        tracedObjects: counted.total,
        breakdown: counted,
        tracedPerColumn: Number((counted.total / columnCount).toFixed(1)),
      },
      null,
      0,
    ),
  );
};

(async () => {
  await run({ label: '33 objects / 591 fields (measured workspace)', objectCount: 33, columnsPerObject: 14, relationsPerObject: 4, repeats: 7 });
  await run({ label: '33 objects / no relations', objectCount: 33, columnsPerObject: 18, relationsPerObject: 0, repeats: 7 });
  await run({ label: '100 objects / ~1800 columns (prod-sized)', objectCount: 100, columnsPerObject: 14, relationsPerObject: 4, repeats: 7 });
  await run({ label: '1 object / 18 columns', objectCount: 1, columnsPerObject: 18, relationsPerObject: 0, repeats: 7 });
})();
