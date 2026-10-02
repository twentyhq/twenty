import { type FieldFunctionOptions } from '@apollo/client/cache';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';

import { RichTextFieldEditor } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor';
import { modifyRecordFromCache } from '@/object-record/cache/utils/modifyRecordFromCache';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';

const mockEditor = {
  document: [] as { type: string; content?: string; props?: { url: string } }[],
  selectionPosition: 0,
  replaceBlocks: jest.fn(),
};
const mockUpdateOneRecord = jest.fn();
const mockSyncAttachments = jest.fn();

jest.mock('@/blocknote-editor/blocks/Schema', () => ({ BLOCK_SCHEMA: {} }));
jest.mock('@blocknote/react', () => ({
  useCreateBlockNote: () => mockEditor,
}));
jest.mock('@/blocknote-editor/components/BlockEditor', () => ({
  BlockEditor: ({ onChange }: { onChange: () => void }) => (
    <button onClick={onChange}>Edit document</button>
  ),
}));
jest.mock(
  '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig',
  () => ({
    BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG: {},
  }),
);
jest.mock('@/blocknote-editor/hooks/useAttachmentSync', () => ({
  useAttachmentSync: () => ({ syncAttachments: mockSyncAttachments }),
}));
jest.mock('@/activities/files/hooks/useUploadAttachmentFile', () => ({
  useUploadAttachmentFile: () => ({ uploadAttachmentFile: jest.fn() }),
}));
jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: {
      id: 'object-id',
      fields: [{ id: 'field-id', name: 'richText' }],
    },
  }),
}));
jest.mock('@/object-metadata/hooks/useApolloCoreClient', () => ({
  useApolloCoreClient: () => ({ cache: {} }),
}));
jest.mock('@/object-record/cache/utils/modifyRecordFromCache', () => ({
  modifyRecordFromCache: jest.fn(),
}));
jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: () => ({ records: [] }),
}));
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({ updateOneRecord: mockUpdateOneRecord }),
}));
jest.mock('@/object-record/read-only/hooks/useIsRecordFieldReadOnly', () => ({
  useIsRecordFieldReadOnly: () => false,
}));
jest.mock('@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack', () => ({
  usePushFocusItemToFocusStack: () => ({
    pushFocusItemToFocusStack: jest.fn(),
  }),
}));
jest.mock(
  '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById',
  () => ({
    useRemoveFocusItemFromFocusStackById: () => ({
      removeFocusItemFromFocusStackById: jest.fn(),
    }),
  }),
);
jest.mock('@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement', () => ({
  useHotkeysOnFocusedElement: jest.fn(),
}));

describe('RichTextFieldEditor autosave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockEditor.replaceBlocks.mockReset();
    mockUpdateOneRecord.mockReset();
    mockSyncAttachments.mockReset();
    jest.mocked(modifyRecordFromCache).mockReset();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it.each([
    {
      scenario: 'an image URL is normalized by the save echo',
      image: {
        type: 'image',
        props: { url: 'https://example.com:443/image.png' },
      },
      expectedImageUrl: 'https://example.com/image.png',
    },
    {
      scenario: 'an image URL is malformed',
      image: { type: 'image', props: { url: 'not-a-url' } },
      expectedImageUrl: 'not-a-url',
    },
    {
      scenario: 'the document has no image',
      image: null,
      expectedImageUrl: undefined,
    },
  ])(
    'keeps the selection when $scenario, then adopts a real remote edit',
    async ({ image, expectedImageUrl }) => {
      const recordId = 'record-1';
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const initialDocument = [
        { type: 'paragraph', content: 'First paragraph' },
        ...(image ? [image] : []),
        { type: 'paragraph', content: 'Last paragraph' },
      ];
      const editedDocument = [
        { type: 'paragraph', content: 'Edited first paragraph' },
        ...(image ? [image] : []),
        { type: 'paragraph', content: 'Last paragraph' },
      ];
      const store = createStore();
      const recordAtom = recordStoreFamilyState.atomFamily(recordId);

      store.set(recordAtom, {
        id: recordId,
        __typename: 'Company',
        richText: {
          blocknote: JSON.stringify(initialDocument),
          markdown: null,
        },
      });

      mockEditor.document = initialDocument;
      mockEditor.selectionPosition = 6;
      mockEditor.replaceBlocks.mockImplementation((_, blocks) => {
        mockEditor.document = blocks;
        mockEditor.selectionPosition = blocks.length;
      });
      mockUpdateOneRecord.mockImplementation(({ updateOneRecordInput }) => {
        store.set(recordAtom, (record) => ({
          ...record,
          id: recordId,
          __typename: 'Company',
          richText: updateOneRecordInput.richText,
        }));
      });

      render(
        <Provider store={store}>
          <RichTextFieldEditor
            recordId={recordId}
            objectNameSingular="company"
            fieldName="richText"
          />
        </Provider>,
      );

      mockEditor.document = editedDocument;
      await user.click(screen.getByRole('button', { name: 'Edit document' }));

      act(() => {
        jest.advanceTimersByTime(500);
      });
      const preparedBody = JSON.stringify([
        { type: 'paragraph', content: 'Edited first paragraph' },
        ...(image ? [{ type: 'image', props: { url: expectedImageUrl } }] : []),
        { type: 'paragraph', content: 'Last paragraph' },
      ]);
      expect(mockUpdateOneRecord).not.toHaveBeenCalled();
      expect(
        (store.get(recordAtom)?.richText as { blocknote: string }).blocknote,
      ).toBe(preparedBody);
      const cacheFieldModifier = jest.mocked(modifyRecordFromCache).mock
        .lastCall?.[0].fieldModifiers.richText;
      expect(
        cacheFieldModifier?.(undefined, {} as FieldFunctionOptions),
      ).toEqual({
        blocknote: preparedBody,
        markdown: null,
      });
      expect(mockSyncAttachments).toHaveBeenCalledWith(
        preparedBody,
        JSON.stringify(initialDocument),
      );

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockUpdateOneRecord).toHaveBeenCalledTimes(1);
      const savedBlocknote =
        mockUpdateOneRecord.mock.calls[0][0].updateOneRecordInput.richText
          .blocknote;
      expect(savedBlocknote).toBe(preparedBody);
      expect(mockEditor.replaceBlocks).not.toHaveBeenCalled();
      expect(mockEditor.selectionPosition).toBe(6);

      const remoteDocument = [
        { type: 'paragraph', content: 'A remote change' },
        ...(image ? [image] : []),
        { type: 'paragraph', content: 'Last paragraph' },
      ];
      act(() => {
        store.set(recordAtom, (record) => ({
          ...record,
          id: recordId,
          __typename: 'Company',
          richText: {
            blocknote: JSON.stringify(remoteDocument),
            markdown: null,
          },
        }));
      });

      expect(mockEditor.replaceBlocks).toHaveBeenCalledTimes(1);
      expect(mockEditor.document[0].content).toBe('A remote change');
    },
  );
});
