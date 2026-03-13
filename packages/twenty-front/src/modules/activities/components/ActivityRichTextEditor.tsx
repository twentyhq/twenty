import { useCallback, useRef } from 'react';
import { useStore } from 'jotai';
import { v4 } from 'uuid';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { RichTextFieldEditor } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { isNonTextWritingKey } from '@/ui/utilities/hotkey/utils/isNonTextWritingKey';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Key } from 'ts-key-enum';

type ActivityRichTextEditorProps = {
  activityId: string;
  activityObjectNameSingular:
    | CoreObjectNameSingular.Task
    | CoreObjectNameSingular.Note;
};

export const ActivityRichTextEditor = ({
  activityId,
  activityObjectNameSingular,
}: ActivityRichTextEditorProps) => {
  const store = useStore();

  const editorRef = useRef<typeof BLOCK_SCHEMA.BlockNoteEditor | null>(null);

  const { upsertActivity } = useUpsertActivity({
    activityObjectNameSingular,
  });

  const [canCreateActivity, setCanCreateActivity] = useAtomState(
    canCreateActivityState,
  );

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const { labelIdentifierFieldMetadataItem } =
    useLabelIdentifierFieldMetadataItem({
      objectNameSingular: activityObjectNameSingular,
    });

  const recordTitleCellId = getRecordFieldInputInstanceId({
    recordId: activityId,
    fieldName: labelIdentifierFieldMetadataItem?.name,
    prefix: RecordTitleCellContainerType.ShowPage,
  });

  const handlePersistBody = useCallback(
    (blocknote: string) => {
      if (!canCreateActivity) {
        setCanCreateActivity(true);
      }

      const activity = store.get(
        recordStoreFamilyState.atomFamily(activityId),
      ) as Task | Note | null;

      if (isDefined(activity)) {
        upsertActivity({
          activity,
          input: {
            bodyV2: { blocknote, markdown: null },
          },
        });
      }
    },
    [
      canCreateActivity,
      setCanCreateActivity,
      store,
      activityId,
      upsertActivity,
    ],
  );

  const handleFocus = useCallback(() => {
    const isRecordTitleCellOpen = store.get(
      isTitleCellInEditModeComponentState.atomFamily({
        instanceId: recordTitleCellId,
      }),
    );

    if (isRecordTitleCellOpen) {
      editorRef.current?.domElement?.blur();
      return;
    }

    pushFocusItemToFocusStack({
      component: {
        instanceId: activityId,
        type: FocusComponentType.ACTIVITY_RICH_TEXT_EDITOR,
      },
      focusId: activityId,
      globalHotkeysConfig: BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG,
    });
  }, [recordTitleCellId, activityId, pushFocusItemToFocusStack, store]);

  const handleBlur = useCallback(() => {
    const isRecordTitleCellOpen = store.get(
      isTitleCellInEditModeComponentState.atomFamily({
        instanceId: recordTitleCellId,
      }),
    );

    if (isRecordTitleCellOpen) {
      return;
    }

    removeFocusItemFromFocusStackById({ focusId: activityId });
  }, [activityId, recordTitleCellId, removeFocusItemFromFocusStackById, store]);

  const focusRichTextEditorWhenFocusOnSidePanel = (
    keyboardEvent: KeyboardEvent,
  ) => {
    if (keyboardEvent.key === Key.Escape) {
      return;
    }

    const isWritingText =
      !isNonTextWritingKey(keyboardEvent.key) &&
      !keyboardEvent.ctrlKey &&
      !keyboardEvent.metaKey;

    if (!isWritingText) {
      return;
    }

    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    keyboardEvent.stopImmediatePropagation();

    const newBlockId = v4();
    const newBlock = {
      id: newBlockId,
      type: 'paragraph' as const,
      content: keyboardEvent.key,
    };

    const lastBlock = editor.document[editor.document.length - 1];
    editor.insertBlocks([newBlock], lastBlock);

    editor.setTextCursorPosition(newBlockId, 'end');
    editor.focus();
  };

  useHotkeysOnFocusedElement({
    keys: '*',
    callback: focusRichTextEditorWhenFocusOnSidePanel,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [focusRichTextEditorWhenFocusOnSidePanel],
  });

  return (
    <RichTextFieldEditor
      recordId={activityId}
      objectNameSingular={activityObjectNameSingular}
      fieldName="bodyV2"
      onPersistBody={handlePersistBody}
      onFocus={handleFocus}
      onBlur={handleBlur}
      editorRef={editorRef}
    />
  );
};
