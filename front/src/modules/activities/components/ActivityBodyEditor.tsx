import { useEffect, useMemo, useState } from 'react';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import debounce from 'lodash.debounce';

import { Activity } from '@/activities/types/Activity';
import { useUpdateOneObjectRecord } from '@/object-record/hooks/useUpdateOneObjectRecord';
import { BlockEditor } from '@/ui/input/editor/components/BlockEditor';

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
  const { updateOneObject } = useUpdateOneObjectRecord({
    objectNameSingular: 'activity',
  });

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    const onInternalChange = (activityBody: string) => {
      setBody(activityBody);
      updateOneObject?.({
        idToUpdate: activity.id,
        input: {
          body: activityBody,
        },
      });
    };

    return debounce(onInternalChange, 200);
  }, [updateOneObject, activity.id]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent:
      isNonEmptyString(activity.body) && activity.body !== '{}'
        ? JSON.parse(activity.body)
        : undefined,
    editorDOMAttributes: { class: 'editor' },
    onEditorContentChange: (editor) => {
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
  });

  return (
    <StyledBlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </StyledBlockNoteStyledContainer>
  );
};
