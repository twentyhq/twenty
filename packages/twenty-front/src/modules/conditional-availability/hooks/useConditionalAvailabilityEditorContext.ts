import { ConditionalAvailabilityEditorContext } from '@/conditional-availability/contexts/ConditionalAvailabilityEditorContext';
import { useContext } from 'react';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export const useConditionalAvailabilityEditorContext = () => {
  const conditionalAvailabilityEditorContext = useContext(
    ConditionalAvailabilityEditorContext,
  );

  if (!isDefined(conditionalAvailabilityEditorContext)) {
    throw new Error(
      doNotTranslate(
        'useConditionalAvailabilityEditorContext must be used inside ConditionalAvailabilityEditor',
      ),
    );
  }

  return conditionalAvailabilityEditorContext;
};
