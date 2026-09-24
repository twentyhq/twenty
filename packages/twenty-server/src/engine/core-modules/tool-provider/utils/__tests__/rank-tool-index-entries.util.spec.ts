import { ToolCategory } from 'twenty-shared/ai';

import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { rankToolIndexEntries } from 'src/engine/core-modules/tool-provider/utils/rank-tool-index-entries.util';

const buildCrudEntries = ({
  objectName,
  singular,
  plural,
  labelPlural,
}: {
  objectName: string;
  singular: string;
  plural: string;
  labelPlural: string;
}): ToolIndexEntry[] =>
  [
    ['find_many', plural, `Search for ${labelPlural} records.`],
    ['find_one', singular, `Retrieve a single ${labelPlural} record by ID.`],
    [
      'group_by',
      plural,
      `Group ${labelPlural} records. Use for questions like "total revenue by company".`,
    ],
    ['create_one', singular, `Create a new ${labelPlural} record.`],
    ['create_many', plural, `Create multiple ${labelPlural} records.`],
    ['update_one', singular, `Update an existing ${labelPlural} record.`],
    ['update_many', plural, `Update many ${labelPlural} records.`],
    ['upsert_many', plural, `Insert or update many ${labelPlural} records.`],
    ['delete_one', singular, `Delete a ${labelPlural} record.`],
    ['delete_many', plural, `Delete many ${labelPlural} records.`],
  ].map(([operation, objectNameForm, description]) => ({
    name: `${operation}_${objectNameForm}`,
    label: `${operation} ${labelPlural}`,
    description,
    category: ToolCategory.DATABASE_CRUD,
    executionRef: {
      kind: 'database_crud',
      objectNameSingular: objectName,
      operation,
    },
    objectName,
    operation,
  })) as ToolIndexEntry[];

const buildStaticEntry = (
  name: string,
  category: ToolCategory,
  description: string,
): ToolIndexEntry => ({
  name,
  label: name,
  description,
  category,
  executionRef: { kind: 'static', toolId: name },
});

const ENTRIES: ToolIndexEntry[] = [
  ...buildCrudEntries({
    objectName: 'person',
    singular: 'person',
    plural: 'people',
    labelPlural: 'People',
  }),
  ...buildCrudEntries({
    objectName: 'company',
    singular: 'company',
    plural: 'companies',
    labelPlural: 'Companies',
  }),
  ...buildCrudEntries({
    objectName: 'opportunity',
    singular: 'opportunity',
    plural: 'opportunities',
    labelPlural: 'Opportunities',
  }),
  ...buildCrudEntries({
    objectName: 'note',
    singular: 'note',
    plural: 'notes',
    labelPlural: 'Notes',
  }),
  ...buildCrudEntries({
    objectName: 'noteTarget',
    singular: 'note_target',
    plural: 'note_targets',
    labelPlural: 'Note Targets',
  }),
  buildStaticEntry(
    'list_workflows',
    ToolCategory.WORKFLOW,
    'List the workflows of the workspace.',
  ),
  buildStaticEntry(
    'list_workflow_runs',
    ToolCategory.WORKFLOW,
    'List the runs of a workflow.',
  ),
  buildStaticEntry(
    'get_workflow_run',
    ToolCategory.WORKFLOW,
    'Get a single workflow run with its step outputs.',
  ),
  buildStaticEntry(
    'create_complete_workflow',
    ToolCategory.WORKFLOW,
    'Create a workflow with its trigger and steps.',
  ),
  buildStaticEntry(
    'send_email',
    ToolCategory.ACTION,
    'Send an email from a connected account.',
  ),
];

const rank = (query: string, limit = 5) =>
  rankToolIndexEntries({ entries: ENTRIES, query, limit });

const getNames = (query: string, limit = 5) =>
  rank(query, limit).matches.map((entry) => entry.name);

describe('rankToolIndexEntries', () => {
  it('ranks the exact singular create tool first for "create person"', () => {
    expect(getNames('create person')[0]).toBe('create_one_person');
  });

  it('follows the grammatical number of the query for regular plurals', () => {
    expect(getNames('create company')[0]).toBe('create_one_company');
    expect(getNames('create companies')[0]).toBe('create_many_companies');
  });

  it('matches the irregular plural through the object aliases', () => {
    expect(getNames('create people').slice(0, 2)).toEqual([
      'create_many_people',
      'create_one_person',
    ]);
  });

  it('returns the company CRUD tools for "companies"', () => {
    const names = getNames('companies', 10);

    expect(names).toHaveLength(10);
    expect(names.every((name) => /_compan(y|ies)$/.test(name))).toBe(true);
  });

  it('maps listing verbs onto find tools', () => {
    expect(getNames('list opportunities')[0]).toBe('find_many_opportunities');
    expect(getNames('find opportunities').slice(0, 2)).toEqual([
      'find_many_opportunities',
      'find_one_opportunity',
    ]);
  });

  it('maps counting verbs onto group_by tools', () => {
    expect(getNames('count opportunities')[0]).toBe('group_by_opportunities');
  });

  it('still matches a verb literally when a tool name uses it', () => {
    expect(getNames('list workflows')[0]).toBe('list_workflows');
  });

  it('finds workflow run tools for "workflow runs"', () => {
    expect(getNames('workflow runs').slice(0, 2)).toEqual([
      'list_workflow_runs',
      'get_workflow_run',
    ]);
  });

  it('matches name prefixes of at least three characters', () => {
    const names = getNames('compan', 10);

    expect(names).toHaveLength(10);
    expect(names.every((name) => /_compan(y|ies)$/.test(name))).toBe(true);
    expect(getNames('co')).toEqual([]);
  });

  it('prefers the object the query names over one that merely contains it', () => {
    expect(getNames('create note').slice(0, 2)).toEqual([
      'create_one_note',
      'create_many_notes',
    ]);
  });

  it('matches multi-word object names', () => {
    expect(getNames('create note targets')[0]).toBe('create_many_note_targets');
  });

  it('returns nothing for a query made only of stopwords', () => {
    expect(rank('the of all')).toEqual({ matches: [], totalMatches: 0 });
  });

  it('returns nothing when no entry matches', () => {
    expect(rank('invoice reconciliation')).toEqual({
      matches: [],
      totalMatches: 0,
    });
  });

  it('caps matches at the limit while reporting every match in totalMatches', () => {
    const { matches, totalMatches } = rank('companies', 3);

    expect(matches).toHaveLength(3);
    expect(totalMatches).toBeGreaterThanOrEqual(10);
  });

  it('breaks score ties by name so the order does not depend on input order', () => {
    const reversed = rankToolIndexEntries({
      entries: [...ENTRIES].reverse(),
      query: 'companies',
      limit: 25,
    }).matches.map((entry) => entry.name);

    expect(reversed).toEqual(getNames('companies', 25));
    expect(getNames('companies', 10)).toEqual([
      'create_many_companies',
      'delete_many_companies',
      'find_many_companies',
      'group_by_companies',
      'update_many_companies',
      'upsert_many_companies',
      'create_one_company',
      'delete_one_company',
      'find_one_company',
      'update_one_company',
    ]);
  });
});
