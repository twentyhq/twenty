import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { mockedNoteRecords } from '~/testing/mock-data/generated/data/notes/mock-notes-data';

const allMockedNoteRecords = mockedNoteRecords as ObjectRecord[];

export const mockedNotes = allMockedNoteRecords;

export const getMockNoteRecord = (
  overrides?: Partial<ObjectRecord>,
  index = 0,
) => {
  return {
    ...allMockedNoteRecords[index],
    ...overrides,
  };
};
