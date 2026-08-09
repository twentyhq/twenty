import { type ObjectRecord } from 'twenty-shared/types';

import { getPersonAvatarFileHandover } from 'src/engine/api/common/common-query-runners/utils/get-person-avatar-file-handover.util';

describe('getPersonAvatarFileHandover', () => {
  const survivorPersonId = 'survivor-person-id';
  const absorbedPersonId = 'absorbed-person-id';

  const buildPerson = (id: string, fileIds: string[]): ObjectRecord =>
    ({
      id,
      avatarFile: fileIds.map((fileId) => ({ fileId, url: `${fileId}-url` })),
    }) as unknown as ObjectRecord;

  it('hands the file over when the avatar comes from an absorbed record', () => {
    const handover = getPersonAvatarFileHandover({
      mergedAvatarFile: [{ fileId: 'file-id', url: 'file-id-url' }],
      recordsToMerge: [
        buildPerson(survivorPersonId, []),
        buildPerson(absorbedPersonId, ['file-id']),
      ],
      survivorPersonId,
    });

    expect(handover).toEqual({
      fileIdsToClaim: ['file-id'],
      previousOwnerPersonIds: [absorbedPersonId],
    });
  });

  it('only claims the files the survivor does not already own', () => {
    const handover = getPersonAvatarFileHandover({
      mergedAvatarFile: [{ fileId: 'survivor-file-id' }, { fileId: 'file-id' }],
      recordsToMerge: [
        buildPerson(survivorPersonId, ['survivor-file-id']),
        buildPerson(absorbedPersonId, ['file-id']),
      ],
      survivorPersonId,
    });

    expect(handover?.fileIdsToClaim).toEqual(['file-id']);
  });

  it('returns null when the survivor already owns the merged avatar', () => {
    const handover = getPersonAvatarFileHandover({
      mergedAvatarFile: [{ fileId: 'file-id' }],
      recordsToMerge: [
        buildPerson(survivorPersonId, ['file-id']),
        buildPerson(absorbedPersonId, ['other-file-id']),
      ],
      survivorPersonId,
    });

    expect(handover).toBeNull();
  });

  it('only lists the absorbed records that actually held the merged file', () => {
    const handover = getPersonAvatarFileHandover({
      mergedAvatarFile: [{ fileId: 'file-id' }],
      recordsToMerge: [
        buildPerson(survivorPersonId, []),
        buildPerson(absorbedPersonId, ['file-id']),
        buildPerson('unrelated-person-id', ['unrelated-file-id']),
        buildPerson('avatarless-person-id', []),
      ],
      survivorPersonId,
    });

    expect(handover?.previousOwnerPersonIds).toEqual([absorbedPersonId]);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
    ['an empty array', []],
    ['a non-array value', 'not-an-array'],
    ['entries without a file id', [{ url: 'url-without-file-id' }]],
  ])(
    'returns null when the merged avatar is %s',
    (_label, mergedAvatarFile) => {
      const handover = getPersonAvatarFileHandover({
        mergedAvatarFile,
        recordsToMerge: [
          buildPerson(survivorPersonId, []),
          buildPerson(absorbedPersonId, ['file-id']),
        ],
        survivorPersonId,
      });

      expect(handover).toBeNull();
    },
  );

  it('returns null when the survivor is not among the merged records', () => {
    const handover = getPersonAvatarFileHandover({
      mergedAvatarFile: [{ fileId: 'file-id' }],
      recordsToMerge: [buildPerson(absorbedPersonId, ['file-id'])],
      survivorPersonId,
    });

    expect(handover).toBeNull();
  });
});
