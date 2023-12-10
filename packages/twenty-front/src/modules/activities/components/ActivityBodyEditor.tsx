import { useEffect, useMemo, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { getDefaultReactSlashMenuItems, useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';

import { Activity } from '@/activities/types/Activity';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

const StyledBlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type ActivityBodyEditorProps = {
  activity: Pick<Activity, 'id' | 'body'>;
  onChange?: (activityBody: string) => void;
};

export const ActivityBodyEditor = ({
  activity,
  onChange,
}: ActivityBodyEditorProps) => {
  const [body, setBody] = useState<string | null>(null);
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: 'activity',
    refetchFindManyQuery: true,
  });

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    const onInternalChange = (activityBody: string) => {
      setBody(activityBody);
      updateOneRecord?.({
        idToUpdate: activity.id,
        input: {
          body: activityBody,
        },
      });
    };

    return debounce(onInternalChange, 200);
  }, [updateOneRecord, activity.id]);

  let slashMenuItems = [...getDefaultReactSlashMenuItems()];
  const imagesActivated = useIsFeatureEnabled('IS_NOTE_CREATE_IMAGES_ENABLED');

  if (!imagesActivated) {
    slashMenuItems = slashMenuItems.filter((x) => x.name != 'Image');
  }

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent:
      isNonEmptyString(activity.body) && activity.body !== '{}'
        ? JSON.parse(activity.body)
        : undefined,
    domAttributes: { editor: { class: 'editor' } },
    onEditorContentChange: (editor) => {
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
    slashMenuItems,
  });

  return (
    <StyledBlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </StyledBlockNoteStyledContainer>
  );
};
