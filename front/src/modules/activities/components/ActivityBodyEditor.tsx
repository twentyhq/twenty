import { useEffect, useMemo, useState } from 'react';
import { getOperationName } from '@apollo/client/utilities';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

import { BlockEditor } from '@/ui/editor/components/BlockEditor';
import { Activity, useUpdateActivityMutation } from '~/generated/graphql';

import { GET_ACTIVITIES_BY_TARGETS } from '../queries/select';

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type OwnProps = {
  activity: Pick<Activity, 'id' | 'body'>;
  onChange?: (activityBody: string) => void;
};

export function ActivityBodyEditor({ activity, onChange }: OwnProps) {
  const [updateActivityMutation] = useUpdateActivityMutation();

  const [body, setBody] = useState<string | null>(null);

  useEffect(() => {
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange]);

  const debounceOnChange = useMemo(() => {
    function onInternalChange(activityBody: string) {
      setBody(activityBody);
      updateActivityMutation({
        variables: {
          id: activity.id,
          body: activityBody,
        },
        refetchQueries: [getOperationName(GET_ACTIVITIES_BY_TARGETS) ?? ''],
      });
    }

    return debounce(onInternalChange, 200);
  }, [activity, updateActivityMutation, setBody]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: activity.body ? JSON.parse(activity.body) : undefined,
    editorDOMAttributes: { class: 'editor' },
    onEditorContentChange: (editor) => {
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
  });

  return (
    <BlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </BlockNoteStyledContainer>
  );
}
