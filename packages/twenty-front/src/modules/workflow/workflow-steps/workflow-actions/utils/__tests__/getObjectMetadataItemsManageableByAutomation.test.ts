import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getObjectMetadataItemsManageableByAutomation } from '@/workflow/workflow-steps/workflow-actions/utils/getObjectMetadataItemsManageableByAutomation';

const buildObjectMetadataItem = ({
  nameSingular,
  isActive = true,
  isSystem = false,
}: {
  nameSingular: string;
  isActive?: boolean;
  isSystem?: boolean;
}) =>
  ({
    id: nameSingular,
    nameSingular,
    isActive,
    isSystem,
  }) as EnrichedObjectMetadataItem;

describe('getObjectMetadataItemsManageableByAutomation', () => {
  it('keeps system objects that are not blocked from automation', () => {
    const result = getObjectMetadataItemsManageableByAutomation([
      buildObjectMetadataItem({ nameSingular: 'person' }),
      buildObjectMetadataItem({ nameSingular: 'noteTarget', isSystem: true }),
      buildObjectMetadataItem({ nameSingular: 'attachment', isSystem: true }),
    ]);

    expect(result.map((item) => item.nameSingular)).toEqual([
      'person',
      'noteTarget',
      'attachment',
    ]);
  });

  it('excludes objects blocked from automation, system or not', () => {
    const result = getObjectMetadataItemsManageableByAutomation([
      buildObjectMetadataItem({ nameSingular: 'company' }),
      buildObjectMetadataItem({ nameSingular: 'workflow' }),
      buildObjectMetadataItem({ nameSingular: 'workflowRun', isSystem: true }),
      buildObjectMetadataItem({
        nameSingular: 'workspaceMember',
        isSystem: true,
      }),
    ]);

    expect(result.map((item) => item.nameSingular)).toEqual(['company']);
  });

  it('excludes inactive objects', () => {
    const result = getObjectMetadataItemsManageableByAutomation([
      buildObjectMetadataItem({ nameSingular: 'person', isActive: false }),
    ]);

    expect(result).toEqual([]);
  });

  it('lists system objects after regular ones', () => {
    const result = getObjectMetadataItemsManageableByAutomation([
      buildObjectMetadataItem({ nameSingular: 'taskTarget', isSystem: true }),
      buildObjectMetadataItem({ nameSingular: 'person' }),
    ]);

    expect(result.map((item) => item.nameSingular)).toEqual([
      'person',
      'taskTarget',
    ]);
  });
});
