import {
  buildClientSchema,
  buildSchema,
  findBreakingChanges,
  introspectionFromSchema,
} from 'graphql';

import { allowUnreleasedFieldRemovals } from '../allow-unreleased-field-removals';

const introspect = (fields: string, inputFields: string) =>
  introspectionFromSchema(
    buildSchema(`
      type Query { workspace: Workspace }
      type Mutation { update(input: WorkspaceInput): Workspace }
      type Workspace { ${fields} }
      input WorkspaceInput { ${inputFields} }
    `),
  );

const released = introspect('name: String', 'name: String');
const main = introspect(
  'name: String, model: String',
  'name: String, model: String',
);

const changes = (current: ReturnType<typeof introspect>) =>
  findBreakingChanges(
    buildClientSchema(
      allowUnreleasedFieldRemovals({ main, current, released }),
    ),
    buildClientSchema(current),
  );

describe('allowUnreleasedFieldRemovals', () => {
  it('allows removing output and input fields absent from the release', () => {
    expect(changes(released)).toEqual([]);
  });

  it('still rejects removing released output and input fields', () => {
    expect(changes(introspect('model: String', 'model: String'))).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'FIELD_REMOVED',
          description: expect.stringContaining('Workspace.name'),
        }),
        expect.objectContaining({
          type: 'FIELD_REMOVED',
          description: expect.stringContaining('WorkspaceInput.name'),
        }),
      ]),
    );
  });

  it('still rejects changing the type of an unreleased field', () => {
    expect(
      changes(
        introspect('name: String, model: Int', 'name: String, model: Int'),
      ),
    ).toHaveLength(2);
  });

  it('does not mutate the main baseline', () => {
    allowUnreleasedFieldRemovals({ main, current: released, released });
    expect(
      findBreakingChanges(buildClientSchema(main), buildClientSchema(released)),
    ).toHaveLength(2);
  });

  it('still rejects whole type removals', () => {
    const current = introspectionFromSchema(
      buildSchema('type Query { name: String }'),
    );
    expect(changes(current)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'TYPE_REMOVED' }),
      ]),
    );
  });
});

describe('interface fields', () => {
  const introspectInterface = (fields: string) =>
    introspectionFromSchema(
      buildSchema(`
      interface Item { ${fields} }
      type Product implements Item { ${fields} }
      type Query { item: Item }
    `),
    );

  it('allows removing unreleased fields from an interface and its implementation', () => {
    const released = introspectInterface('name: String');
    const main = introspectInterface('name: String, model: String');
    const baseline = allowUnreleasedFieldRemovals({
      main,
      current: released,
      released,
    });
    expect(
      findBreakingChanges(
        buildClientSchema(baseline),
        buildClientSchema(released),
      ),
    ).toEqual([]);
  });

  it('still rejects removing released interface fields', () => {
    const released = introspectInterface('name: String, model: String');
    const current = introspectInterface('name: String');
    const baseline = allowUnreleasedFieldRemovals({
      main: released,
      current,
      released,
    });
    expect(
      findBreakingChanges(
        buildClientSchema(baseline),
        buildClientSchema(current),
      ),
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'FIELD_REMOVED',
          description: expect.stringContaining('Item.model'),
        }),
      ]),
    );
  });
});
