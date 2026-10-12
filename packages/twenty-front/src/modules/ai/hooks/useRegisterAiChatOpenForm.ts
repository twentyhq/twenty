import { useEffect } from 'react';

import { aiChatOpenFormState } from '@/ai/states/aiChatOpenFormState';
import { type AiChatOpenFormRegistration } from '@/ai/types/AiChatOpenFormRegistration';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useRegisterAiChatOpenForm = (
  aiChatOpenFormRegistration: AiChatOpenFormRegistration,
) => {
  const setAiChatOpenForm = useSetAtomState(aiChatOpenFormState);

  useEffect(() => {
    setAiChatOpenForm(aiChatOpenFormRegistration);

    return () =>
      setAiChatOpenForm((currentAiChatOpenForm) =>
        currentAiChatOpenForm?.formId === aiChatOpenFormRegistration.formId
          ? null
          : currentAiChatOpenForm,
      );
  }, [aiChatOpenFormRegistration, setAiChatOpenForm]);
};
