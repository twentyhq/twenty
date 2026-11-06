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
    hasEditedName: false,
  });

  if (nameInput.confirmedDisplayName !== confirmedDisplayName) {
    setNameInput({
      confirmedDisplayName,
      displayName: confirmedDisplayName,
      hasEditedName: false,
    });
  }

  const parsedDisplayName = ASSISTANT_DISPLAY_NAME_SCHEMA.safeParse(
    nameInput.displayName,
  );

  const setDraftDisplayName = (displayName: string) => {
    setNameInput((previousInput) => ({
      ...previousInput,
      displayName,
      hasEditedName: true,
    }));
  };

  const commitName = ():
    | Pick<AiChatAssistantProfile, 'displayName'>
    | undefined => {
    if (!parsedDisplayName.success || !nameInput.hasEditedName) {
      return;
    }

    setNameInput((previousInput) => ({
      ...previousInput,
      displayName: parsedDisplayName.data,
      hasEditedName: false,
    }));

    return { displayName: parsedDisplayName.data };
  };

  return {
    draftDisplayName: nameInput.displayName,
    isNameInvalid: !parsedDisplayName.success,
    setDraftDisplayName,
    commitName,
  };
};
