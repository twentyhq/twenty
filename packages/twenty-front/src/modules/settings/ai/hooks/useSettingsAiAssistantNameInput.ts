import { useState } from 'react';
import {
  getAiChatAssistantProfileSchema,
  type AiChatAssistantProfile,
} from 'twenty-shared/ai';

const ASSISTANT_DISPLAY_NAME_SCHEMA =
  getAiChatAssistantProfileSchema().shape.displayName;

export const useSettingsAiAssistantNameInput = (
  confirmedDisplayName: string,
) => {
  const [nameInput, setNameInput] = useState({
    confirmedDisplayName,
    displayName: confirmedDisplayName,
  });

  if (nameInput.confirmedDisplayName !== confirmedDisplayName) {
    setNameInput({
      confirmedDisplayName,
      displayName: confirmedDisplayName,
    });
  }

  const parsedDisplayName = ASSISTANT_DISPLAY_NAME_SCHEMA.safeParse(
    nameInput.displayName,
  );

  const setDraftDisplayName = (displayName: string) => {
    setNameInput((previousInput) => ({ ...previousInput, displayName }));
  };

  const commitName = ():
    | Pick<AiChatAssistantProfile, 'displayName'>
    | undefined => {
    if (!parsedDisplayName.success) {
      return;
    }

    setDraftDisplayName(parsedDisplayName.data);

    if (parsedDisplayName.data === confirmedDisplayName) {
      return;
    }

    return { displayName: parsedDisplayName.data };
  };

  return {
    draftDisplayName: nameInput.displayName,
    isNameInvalid: !parsedDisplayName.success,
    setDraftDisplayName,
    commitName,
  };
};
