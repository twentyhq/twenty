import { createRecordWithAttachmentHandler } from '@/object-record/record-field/ui/meta-types/input/utils/createRecordWithAttachmentHandler';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const setup = () => {
  let nextRecordId = 0;
  const createRecord = jest.fn(async (recordInput: Partial<ObjectRecord>) => ({
    ...recordInput,
    id: `created-${++nextRecordId}`,
    __typename: 'Pet',
  }));
  const updateRecord = jest
    .fn<
      Promise<void>,
      [{ recordId: string; recordInput: Partial<ObjectRecord> }]
    >()
    .mockResolvedValue(undefined);
  const attachRecord = jest
    .fn<Promise<void>, [string]>()
    .mockResolvedValue(undefined);
  const saveRecordWithAttachment = createRecordWithAttachmentHandler({
    createRecord,
    updateRecord,
    attachRecord,
    fieldMetadataItems: getMockObjectMetadataItemOrThrow('pet').fields,
  });

  return { createRecord, updateRecord, attachRecord, saveRecordWithAttachment };
};

it('retries attachment without creating or updating the saved record, then starts a new creation', async () => {
  const { createRecord, updateRecord, attachRecord, saveRecordWithAttachment } =
    setup();
  const attachmentError = new Error('Attachment failed');
  attachRecord.mockRejectedValueOnce(attachmentError);
  const input = { id: 'draft-id', name: 'Rex' };

  await expect(saveRecordWithAttachment(input)).rejects.toBe(attachmentError);
  const firstRecord = await saveRecordWithAttachment(input);

  expect(createRecord).toHaveBeenCalledTimes(1);
  expect(createRecord).toHaveBeenCalledWith({ name: 'Rex' });
  expect(updateRecord).not.toHaveBeenCalled();
  expect(attachRecord.mock.calls).toEqual([[firstRecord.id], [firstRecord.id]]);

  const secondRecord = await saveRecordWithAttachment(input);

  expect(createRecord).toHaveBeenCalledTimes(2);
  expect(secondRecord.id).not.toBe(firstRecord.id);
  expect(attachRecord).toHaveBeenLastCalledWith(secondRecord.id);
});

it('retries an edited saved record and clears its previous morph target', async () => {
  const { createRecord, updateRecord, attachRecord, saveRecordWithAttachment } =
    setup();
  const attachmentError = new Error('Attachment failed');
  const updateError = new Error('Update failed');
  attachRecord.mockRejectedValueOnce(attachmentError);
  updateRecord.mockRejectedValueOnce(updateError);

  await expect(
    saveRecordWithAttachment({
      name: 'Rex',
      polymorphicOwnerRocketId: 'rocket-id',
    }),
  ).rejects.toBe(attachmentError);
  await expect(saveRecordWithAttachment({ name: 'Renamed' })).rejects.toBe(
    updateError,
  );
  expect(attachRecord).toHaveBeenCalledTimes(1);

  const record = await saveRecordWithAttachment({ name: 'Renamed' });

  expect(createRecord).toHaveBeenCalledTimes(1);
  expect(updateRecord).toHaveBeenCalledTimes(2);
  expect(updateRecord).toHaveBeenLastCalledWith({
    recordId: record.id,
    recordInput: { name: 'Renamed', polymorphicOwnerRocketId: null },
  });
  expect(record).toMatchObject({
    name: 'Renamed',
    polymorphicOwnerRocketId: null,
  });
  expect(attachRecord).toHaveBeenLastCalledWith(record.id);
});

it('does not reuse a record after creation itself fails', async () => {
  const { createRecord, attachRecord, saveRecordWithAttachment } = setup();
  const creationError = new Error('Creation failed');
  createRecord.mockRejectedValueOnce(creationError);

  await expect(saveRecordWithAttachment({ name: 'Rex' })).rejects.toBe(
    creationError,
  );
  expect(attachRecord).not.toHaveBeenCalled();

  const record = await saveRecordWithAttachment({ name: 'Rex' });

  expect(createRecord).toHaveBeenCalledTimes(2);
  expect(attachRecord).toHaveBeenCalledWith(record.id);
});
