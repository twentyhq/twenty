import { type ApplicationExportCoverageEntry } from '@/cli/utilities/pull/application-export-type';
import { formatPullReport } from '@/cli/utilities/pull/format-pull-report';
import { describe, expect, it } from 'vitest';

const buildCoverage = (
  entries: Partial<ApplicationExportCoverageEntry>[],
): ApplicationExportCoverageEntry[] =>
  entries.map((entry, index) => ({
    metadataName: 'view',
    universalIdentifier: `identifier-${index}`,
    status: 'UNSUPPORTED',
    reason: null,
    ...entry,
  }));

const buildReport = (
  overrides: Partial<Parameters<typeof formatPullReport>[0]> = {},
) =>
  formatPullReport({
    writes: [],
    deletions: [],
    unchangedCount: 0,
    skipped: [],
    coverage: [],
    localOnlyRelativePaths: [],
    ...overrides,
  });

describe('formatPullReport', () => {
  it('should group the files it touched by what happened to them', () => {
    const report = buildReport({
      writes: [
        {
          kind: 'object',
          universalIdentifier: 'a',
          relativePath: 'src/objects/pet.object.ts',
          content: '',
          isRegeneration: false,
        },
        {
          kind: 'application',
          universalIdentifier: 'b',
          relativePath: 'src/application.config.ts',
          content: '',
          isRegeneration: true,
        },
      ],
      deletions: [
        {
          universalIdentifier: 'c',
          relativePath: 'src/objects/gone.object.ts',
        },
      ],
      unchangedCount: 3,
    });

    expect(report).toContain('written      src/objects/pet.object.ts');
    expect(report).toContain('regenerated  src/application.config.ts');
    expect(report).toContain('deleted      src/objects/gone.object.ts');
    expect(report).toContain('unchanged    3 file(s)');
  });

  it('should count coverage rows per metadata name under a titled section', () => {
    const report = buildReport({
      coverage: buildCoverage([
        { metadataName: 'view' },
        { metadataName: 'view' },
        { metadataName: 'role' },
        { metadataName: 'roleTarget', status: 'EXCLUDED' },
        { metadataName: 'fieldMetadata', status: 'ENGINE_DERIVED' },
        { metadataName: 'fieldMetadata', status: 'FOREIGN_OWNED' },
      ]),
    });

    expect(report).toContain(
      'Not written, unsupported by this version (3 row(s)):',
    );
    expect(report).toMatch(/role\s+1/);
    expect(report).toMatch(/view\s+2/);
    expect(report).toContain(
      'Owned by another application, not written (1 row(s)):',
    );
    expect(report).toContain('Excluded as workspace runtime state (1 row(s)):');
    expect(report).toContain(
      'Derived by the engine, rebuilt on apply (1 row(s)):',
    );
  });

  it('should omit a section with no rows', () => {
    const report = buildReport({
      coverage: buildCoverage([{ metadataName: 'view' }]),
    });

    expect(report).not.toContain('Excluded as workspace runtime state');
    expect(report).not.toContain('Derived by the engine');
  });

  it('should list identifiers only in verbose mode and cap the list', () => {
    const coverage = buildCoverage(
      Array.from({ length: 25 }, () => ({ metadataName: 'view' })),
    );

    expect(buildReport({ coverage })).not.toContain('identifier-0');

    const verboseReport = buildReport({ coverage, verbose: true });

    expect(verboseReport).toContain('identifier-0');
    expect(verboseReport).toContain('…and 5 more');
  });

  it('should name the entities the writer refused to write', () => {
    const report = buildReport({
      skipped: [
        {
          kind: 'object',
          universalIdentifier: 'junction-uid',
          reason:
            'petCareAgreement: its label identifier field is engine-derived and not part of the export',
        },
      ],
    });

    expect(report).toContain('Not written by the writer:');
    expect(report).toContain('object petCareAgreement:');
  });

  it('should warn about a define file it could not read', () => {
    const report = buildReport({
      unreadableRelativePaths: ['src/objects/broken.object.ts'],
    });

    expect(report).toContain('Could not be read');
    expect(report).toContain('src/objects/broken.object.ts');
  });

  it('should list local entities the workspace does not have', () => {
    const report = buildReport({
      localOnlyRelativePaths: ['src/objects/unpushed.object.ts'],
    });

    expect(report).toContain(
      'Local entities the workspace does not have (left untouched):',
    );
    expect(report).toContain('src/objects/unpushed.object.ts');
  });
});
