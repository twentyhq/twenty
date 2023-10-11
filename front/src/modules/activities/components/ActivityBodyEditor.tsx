import { useEffect, useMemo, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { BlockNoteEditor } from '@blocknote/core';
import { useBlockNote } from '@blocknote/react';
import styled from '@emotion/styled';
import debounce from 'lodash.debounce';

import { BlockEditor } from '@/ui/editor/components/BlockEditor';
import {
  Activity,
  useUpdateActivityMutation,
  // useUploadAttachmentMutation,
} from '~/generated/graphql';

import { ACTIVITY_UPDATE_FRAGMENT } from '../graphql/fragments/activityUpdateFragment';

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
  const [updateActivityMutation] = useUpdateActivityMutation();
  // const [uploadAttachmentMutation] = useUploadAttachmentMutation();

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

  const handleUploadAttachment = (file: File): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          const dataURL = event.target.result as string;
          resolve(dataURL);
          // uploadAttachmentMutation({
          //   variables: {
          //     file: file,
          //     activityId: activity.id,
          //   },
          // })
        } else {
          reject(new Error('Failed to read the file.'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const debounceOnChange = useMemo(() => {
    const onInternalChange = (activityBody: string) => {
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
    };

    return debounce(onInternalChange, 200);
  }, [updateActivityMutation, activity.id, cachedActivity]);

  const editor: BlockNoteEditor | null = useBlockNote({
    initialContent: activity.body ? JSON.parse(activity.body) : undefined,
    domAttributes: {
      editor: { class: 'editor' },
    },
    onEditorContentChange: (editor) => {
      debounceOnChange(JSON.stringify(editor.topLevelBlocks) ?? '');
    },
    uploadFile: handleUploadAttachment,
  });

  return (
    <StyledBlockNoteStyledContainer>
      <BlockEditor editor={editor} />
    </StyledBlockNoteStyledContainer>
  );
};
