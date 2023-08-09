import { useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

import { BlockEditor } from '@/ui/editor/components/BlockEditor';
import { Activity, useUpdateActivityMutation } from '~/generated/graphql';

import { ACTIVITY_UPDATE_FRAGMENT } from '../queries/update';

const BlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type OwnProps = {
  activity: Pick<Activity, 'id' | 'body'>;
  onChange?: (activityBody: string) => void;
};

export function ActivityBodyEditor({ activity, onChange }: OwnProps) {
  const [updateActivityMutation] = useUpdateActivityMutation();

  const client = useApolloClient();
  const cachedActivity = client.readFragment({
    id: `Activity:${activity.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

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
          where: {
            id: activity.id,
          },
          data: {
            body: activityBody,
          },
        },
        optimisticResponse: {
          __typename: 'Mutation',
          updateOneActivity: {
            ...cachedActivity,
            body: activityBody,
          },
        },
      });
    }

    return debounce(onInternalChange, 200);
  }, [updateActivityMutation, activity.id, cachedActivity]);

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
