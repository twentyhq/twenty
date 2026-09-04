import { useStore } from 'jotai';
import { useCallback, useRef } from 'react';

import { useUpsertActivity } from '@/activities/hooks/useUpsertActivity';
import { canCreateActivityState } from '@/activities/states/canCreateActivityState';
import { type Note } from '@/activities/types/Note';
import { type Task } from '@/activities/types/Task';
import { type BLOCK_SCHEMA } from '@/blocknote-editor/blocks/Schema';
import { BLOCK_EDITOR_GLOBAL_HOTKEYS_CONFIG } from '@/blocknote-editor/constants/BlockEditorGlobalHotkeysConfig';
import { useLabelIdentifierFieldMetadataItem } from '@/object-metadata/hooks/useLabelIdentifierFieldMetadataItem';
import { RichTextFieldEditor } from '@/object-record/record-field/ui/meta-types/input/components/RichTextFieldEditor';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { isTitleCellInEditModeComponentState } from '@/object-record/record-title-cell/states/isTitleCellInEditModeComponentState';
import { RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useComponentStateSurfaceId } from '@/ui/utilities/state/component-state/hooks/useComponentStateSurfaceId';

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
  const surfaceId = useComponentStateSurfaceId();
  const store = useStore();

  // oxlint-disable-next-line twenty/no-state-useref
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
        surfaceId,
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
  }, [
    recordTitleCellId,
    activityId,
    pushFocusItemToFocusStack,
    store,
    surfaceId,
  ]);

  const handleBlur = useCallback(() => {
    const isRecordTitleCellOpen = store.get(
      isTitleCellInEditModeComponentState.atomFamily({
        instanceId: recordTitleCellId,
        surfaceId,
      }),
    );

    if (isRecordTitleCellOpen) {
      return;
    }

    removeFocusItemFromFocusStackById({ focusId: activityId });
  }, [
    activityId,
    recordTitleCellId,
    removeFocusItemFromFocusStackById,
    store,
    surfaceId,
  ]);

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
