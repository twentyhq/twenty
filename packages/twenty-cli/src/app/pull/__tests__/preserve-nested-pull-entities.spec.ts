import { describe, expect, it } from 'vitest';

import { type PullEntity } from '@/app/pull/build-pull-entities';
import { type PullWrite } from '@/app/pull/plan-pull-writes';
import { preserveNestedPullEntities } from '@/app/pull/preserve-nested-pull-entities';
import { type ScannedSourceFile } from '@/app/source/scan-project-source-files';

const LAYOUT_IDENTIFIER = '11111111-1111-4111-8111-111111111111';
const TAB_IDENTIFIER = '22222222-2222-4222-8222-222222222222';
const WIDGET_IDENTIFIER = '33333333-3333-4333-8333-333333333333';
const LOCAL_WIDGET_IDENTIFIER = '44444444-4444-4444-8444-444444444444';
const LAYOUT_PATH = 'src/page-layouts/company.ts';
const TAB_PATH = 'src/page-layout-tabs/overview.ts';

const widget = { universalIdentifier: WIDGET_IDENTIFIER };
const tab = { universalIdentifier: TAB_IDENTIFIER, widgets: [widget] };
const layout = { universalIdentifier: LAYOUT_IDENTIFIER, tabs: [tab] };
const createEntity = (
  kind: 'pageLayout' | 'pageLayoutTab',
  config: { universalIdentifier: string } & Record<string, unknown>,
): PullEntity => ({
  kind,
  universalIdentifier: config.universalIdentifier,
  config,
  definer: kind === 'pageLayout' ? 'definePageLayout' : 'definePageLayoutTab',
  enumBindings: [],
  defaultFolder: 'src',
  fileSuffix: '.ts',
  fileBaseName: 'fixture',
  parentName: null,
});
const layoutEntity = createEntity('pageLayout', { ...layout, tabs: [] });
const tabEntity = createEntity('pageLayoutTab', tab);
const layoutFile: ScannedSourceFile = {
  relativePath: LAYOUT_PATH,
  entityKey: 'pageLayouts',
  targetFunctionName: 'definePageLayout',
  universalIdentifier: LAYOUT_IDENTIFIER,
  isReadable: true,
  config: layout,
};
const tabFile: ScannedSourceFile = {
  relativePath: TAB_PATH,
  entityKey: 'pageLayoutTabs',
  targetFunctionName: 'definePageLayoutTab',
  universalIdentifier: TAB_IDENTIFIER,
  isReadable: true,
  config: tab,
};
const createWrite = (
  entity: PullEntity,
  relativePath: string,
  isRegeneration = true,
): PullWrite => ({
  kind: entity.kind,
  universalIdentifier: entity.universalIdentifier,
  relativePath,
  isRegeneration,
  content: '',
  requiredSdkExports: [],
});
const layoutWrite = createWrite(layoutEntity, LAYOUT_PATH);
const tabWrite = createWrite(tabEntity, TAB_PATH);

const protect = (
  options: Partial<Parameters<typeof preserveNestedPullEntities>[0]> = {},
) =>
  preserveNestedPullEntities({
    entities: [layoutEntity, tabEntity],
    baseEntities: [],
    protectedIdentifiers: new Set([
      LAYOUT_IDENTIFIER,
      TAB_IDENTIFIER,
      WIDGET_IDENTIFIER,
    ]),
    writes: [layoutWrite],
    deletions: [],
    scannedFiles: [layoutFile],
    ...options,
  });

describe('preserveNestedPullEntities', () => {
  it.each(['unchanged', 'new'])(
    'allows moving a nested definition into a %s file that retains it',
    (destination) => {
      const result = protect({
        scannedFiles: [layoutFile, ...(destination === 'new' ? [] : [tabFile])],
        writes:
          destination === 'new'
            ? [layoutWrite, createWrite(tabEntity, TAB_PATH, false)]
            : [layoutWrite],
      });

      expect(result.skipped).toEqual([]);
      expect(result.writes).toContainEqual(layoutWrite);
    },
  );

  it('does not count an exported definition without a retained or written destination', () => {
    const result = protect();

    expect(result.writes).toEqual([]);
    expect(result.skipped).toEqual([
      expect.objectContaining({ universalIdentifier: LAYOUT_IDENTIFIER }),
    ]);
  });

  it.each(['write', 'delete'])(
    'rechecks the source %s when the destination replacement is skipped',
    (operation) => {
      const result = protect({
        baseEntities: [createEntity('pageLayout', layout), tabEntity],
        scannedFiles: [
          layoutFile,
          {
            ...tabFile,
            config: {
              ...tab,
              widgets: [{ universalIdentifier: LOCAL_WIDGET_IDENTIFIER }],
            },
          },
        ],
        writes: operation === 'write' ? [layoutWrite, tabWrite] : [tabWrite],
        deletions:
          operation === 'delete'
            ? [
                {
                  universalIdentifier: LAYOUT_IDENTIFIER,
                  relativePath: LAYOUT_PATH,
                },
              ]
            : [],
      });

      expect(result.writes).toEqual([]);
      expect(result.deletions).toEqual([]);
      expect(
        result.skipped
          .map(({ universalIdentifier }) => universalIdentifier)
          .sort(),
      ).toEqual([LAYOUT_IDENTIFIER, TAB_IDENTIFIER]);
    },
  );

  it('allows moving a definition into the original contents of a skipped destination', () => {
    const result = protect({
      scannedFiles: [
        layoutFile,
        {
          ...tabFile,
          config: {
            ...tab,
            widgets: [widget, { universalIdentifier: LOCAL_WIDGET_IDENTIFIER }],
          },
        },
      ],
      writes: [layoutWrite, tabWrite],
    });

    expect(result.writes).toEqual([layoutWrite]);
    expect(result.skipped).toEqual([
      expect.objectContaining({ universalIdentifier: TAB_IDENTIFIER }),
    ]);
  });

  it('does not count a file scheduled for deletion as retaining a definition', () => {
    const result = protect({
      baseEntities: [tabEntity],
      scannedFiles: [layoutFile, tabFile],
      deletions: [
        { universalIdentifier: TAB_IDENTIFIER, relativePath: TAB_PATH },
      ],
    });

    expect(result.writes).toEqual([]);
    expect(result.deletions).toEqual([]);
    expect(result.skipped).toHaveLength(2);
  });
});
