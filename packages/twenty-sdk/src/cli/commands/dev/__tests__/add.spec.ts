import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EntityAddCommand } from '../add';
import inquirer from 'inquirer';
import { writeFile } from 'node:fs/promises';
import { pathExists, ensureDir } from '@/cli/utilities/file/fs-utils';
import { buildManifest } from '@/cli/utilities/build/manifest/manifest-build';

vi.mock('inquirer');
vi.mock('node:fs/promises');
vi.mock('@/cli/utilities/file/fs-utils');
vi.mock('@/cli/utilities/build/manifest/manifest-build');

describe('EntityAddCommand - relation', () => {
  let command: EntityAddCommand;

  beforeEach(() => {
    vi.clearAllMocks();
    command = new EntityAddCommand();
    vi.mocked(ensureDir).mockResolvedValue(undefined);
    vi.mocked(pathExists).mockResolvedValue(false);
    vi.mocked(buildManifest).mockResolvedValue({
      manifest: {
        objects: [
          {
            nameSingular: 'myCustomObject',
            namePlural: 'myCustomObjects',
            labelSingular: 'My Custom Object',
            universalIdentifier: 'custom-object-uuid',
          },
        ] as any,
        fields: [],
        indexes: [],
        permissionFlags: [],
        roles: [],
        skills: [],
        agents: [],
        connectionProviders: [],
        logicFunctions: [],
        frontComponents: [],
        publicAssets: [],
        views: [],
        viewFields: [],
        navigationMenuItems: [],
        pageLayouts: [],
        pageLayoutTabs: [],
        commandMenuItems: [],
      },
      filePaths: {} as any,
      errors: [],
      warnings: [],
    });
  });

  it('should successfully create a one-to-many (single-to-single) relation between standard objects', async () => {
    const promptsMock = vi.spyOn(inquirer, 'prompt');
    
    promptsMock
      .mockResolvedValueOnce({ relationType: 'one-to-many' })
      .mockResolvedValueOnce({ baseObjectSource: 'standard' })
      .mockResolvedValueOnce({ baseKey: 'person' })
      .mockResolvedValueOnce({ relSource: 'standard' })
      .mockResolvedValueOnce({ relKey: 'company' })
      .mockResolvedValueOnce({ onDeleteAction: 'CASCADE' })
      .mockResolvedValueOnce({ baseFieldName: 'companies' })
      .mockResolvedValueOnce({ relatedFieldName: 'people' });

    await command.execute('relation');

    expect(writeFile).toHaveBeenCalledTimes(2);

    const [file1Path, file1Content] = vi.mocked(writeFile).mock.calls[0];
    const [file2Path, file2Content] = vi.mocked(writeFile).mock.calls[1];

    expect(file1Path as string).toContain('companies-on-person.ts');
    expect(file1Content as string).toContain("type: FieldType.RELATION");
    expect(file1Content as string).toContain("name: 'companies'");
    expect(file1Content as string).toContain("relationType: RelationType.ONE_TO_MANY");

    expect(file2Path as string).toContain('people-on-company.ts');
    expect(file2Content as string).toContain("type: FieldType.RELATION");
    expect(file2Content as string).toContain("name: 'people'");
    expect(file2Content as string).toContain("relationType: RelationType.MANY_TO_ONE");
    expect(file2Content as string).toContain("onDelete: OnDeleteAction.CASCADE");
    expect(file2Content as string).toContain("joinColumnName: 'peopleId'");
  });

  it('should successfully create a one-to-many-polymorphic relation', async () => {
    const promptsMock = vi.spyOn(inquirer, 'prompt');

    promptsMock
      .mockResolvedValueOnce({ relationType: 'one-to-many-polymorphic' })
      .mockResolvedValueOnce({ baseObjectSource: 'standard' })
      .mockResolvedValueOnce({ baseKey: 'noteTarget' })
      .mockResolvedValueOnce({ selectedRelated: ['standard:person', 'standard:company'] })
      .mockResolvedValueOnce({ onDeleteAction: 'CASCADE' })
      .mockResolvedValueOnce({ baseFieldName: 'targetPerson' })
      .mockResolvedValueOnce({ relatedFieldName: 'noteTargets' })
      .mockResolvedValueOnce({ baseFieldName: 'targetCompany' })
      .mockResolvedValueOnce({ relatedFieldName: 'noteTargets' });

    await command.execute('relation');

    expect(writeFile).toHaveBeenCalledTimes(4);

    const writtenFiles = vi.mocked(writeFile).mock.calls.map(call => call[0]);
    expect(writtenFiles[0] as string).toContain('target-person-on-note-target.ts');
    expect(writtenFiles[1] as string).toContain('note-targets-on-person.ts');
    expect(writtenFiles[2] as string).toContain('target-company-on-note-target.ts');
    expect(writtenFiles[3] as string).toContain('note-targets-on-company.ts');

    const writtenContents = vi.mocked(writeFile).mock.calls.map(call => call[1]);
    
    expect(writtenContents[0] as string).toContain("type: FieldType.MORPH_RELATION");
    expect(writtenContents[0] as string).toContain("name: 'targetPerson'");
    expect(writtenContents[0] as string).toContain("morphId: '");
    expect(writtenContents[0] as string).toContain("relationType: RelationType.MANY_TO_ONE");

    expect(writtenContents[1] as string).toContain("type: FieldType.RELATION");
    expect(writtenContents[1] as string).not.toContain("morphId");
    expect(writtenContents[1] as string).toContain("relationType: RelationType.ONE_TO_MANY");
  });
});
