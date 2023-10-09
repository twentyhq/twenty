import { useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

import { BlockEditor } from '@/ui/editor/components/BlockEditor';
import { Activity, useUpdateActivityMutation } from '~/generated/graphql';

import { ACTIVITY_UPDATE_FRAGMENT } from '../graphql/fragments/activityUpdateFragment';

const StyledBlockNoteStyledContainer = styled.div`
  width: 100%;
`;

type ActivityBodyEditorProps = {
  activity: Pick<Activity, 'body'> & Partial<Pick<Activity, 'id'>>;
  onChange?: (activityBody: string) => void;
};

export const ActivityBodyEditor = ({
  activity,
  onChange,
}: ActivityBodyEditorProps) => {
  const [updateActivityMutation] = useUpdateActivityMutation();

  const client = useApolloClient();
  const cachedActivity = client.readFragment({
    id: `Activity:${activity.id}`,
    fragment: ACTIVITY_UPDATE_FRAGMENT,
  });

  const [body, setBody] = useState<string | null>(null);
  const activityIdRef = useRef(activity.id);

  useEffect(() => {
    activityIdRef.current = activity.id;
    if (body) {
      onChange?.(body);
    }
  }, [body, onChange, activity.id]);

  const debounceOnChange = useMemo(() => {
    const onInternalChange = (activityBody: string) => {
      setBody(activityBody);

      const activityId = activityIdRef.current;
      if (activityId)
        updateActivityMutation({
          variables: {
            where: {
              id: activityId,
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
    };

    return debounce(onInternalChange, 200);
  }, [cachedActivity, updateActivityMutation]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: activity.body ? JSON.parse(activity.body) : undefined,
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
