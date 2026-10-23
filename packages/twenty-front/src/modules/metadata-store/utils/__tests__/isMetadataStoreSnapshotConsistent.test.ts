import {
  isMetadataStoreSnapshotConsistent,
  type MetadataStoreSnapshot,
} from '@/metadata-store/utils/isMetadataStoreSnapshotConsistent';

const buildTarget = (targetObjectMetadataId: string) => ({
  targetObjectMetadata: { id: targetObjectMetadataId },
});

const buildSnapshot = (
  overrides: Partial<MetadataStoreSnapshot>,
): MetadataStoreSnapshot => ({
  objectMetadataItems: [{ id: 'note-target' }, { id: 'company' }],
  fieldMetadataItems: [],
  indexMetadataItems: [],
  views: [],
  ...overrides,
});

describe('isMetadataStoreSnapshotConsistent', () => {
  it('accepts a snapshot where every reference points to an existing object', () => {
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({
          fieldMetadataItems: [
            {
              objectMetadataId: 'note-target',
              relation: buildTarget('company'),
              morphRelations: [buildTarget('company')],
            },
          ],
          indexMetadataItems: [{ objectMetadataId: 'company' }],
          views: [{ objectMetadataId: 'company' }],
        }),
      ),
    ).toBe(true);
  });

  it('rejects a morph relation targeting a removed object', () => {
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({
          fieldMetadataItems: [
            {
              objectMetadataId: 'note-target',
              morphRelations: [buildTarget('company'), buildTarget('garden')],
            },
          ],
        }),
      ),
    ).toBe(false);
  });

  it('rejects a relation targeting a removed object', () => {
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({
          fieldMetadataItems: [
            {
              objectMetadataId: 'company',
              relation: buildTarget('garden'),
            },
          ],
        }),
      ),
    ).toBe(false);
  });

  it('rejects a field, index or view whose object is missing', () => {
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({ fieldMetadataItems: [{ objectMetadataId: 'garden' }] }),
      ),
    ).toBe(false);
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({ indexMetadataItems: [{ objectMetadataId: 'garden' }] }),
      ),
    ).toBe(false);
    expect(
      isMetadataStoreSnapshotConsistent(
        buildSnapshot({ views: [{ objectMetadataId: 'garden' }] }),
      ),
    ).toBe(false);
  });
});
