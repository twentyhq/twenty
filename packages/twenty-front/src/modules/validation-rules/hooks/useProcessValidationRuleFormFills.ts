import { useStore } from 'jotai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { getValidationRuleBrowsingContext } from '@/validation-rules/utils/getValidationRuleBrowsingContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { processedValidationRuleFormFillIdsState } from '@/validation-rules/states/processedValidationRuleFormFillIdsState';
import { validationRuleFormFillState } from '@/validation-rules/states/validationRuleFormFillState';
import { extractValidationRuleFormFills } from '@/validation-rules/utils/extractValidationRuleFormFills';

export const useProcessValidationRuleFormFills = () => {
  const store = useStore();

  const processValidationRuleFormFills = (
    message: Pick<ExtendedUIMessage, 'parts'>,
  ) => {
    const processedFillIds = store.get(
      processedValidationRuleFormFillIdsState.atom,
    );
    const newFills = extractValidationRuleFormFills(message.parts).filter(
      (fill) => !processedFillIds.includes(fill.toolCallId),
    );

    if (newFills.length === 0) {
      return;
    }

    store.set(processedValidationRuleFormFillIdsState.atom, [
      ...processedFillIds,
      ...newFills.map((fill) => fill.toolCallId),
    ]);

    const openValidationRuleForm = getValidationRuleBrowsingContext({
      pathname: window.location.pathname,
      objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
    });

    if (!isDefined(openValidationRuleForm)) {
      return;
    }

    const fillForOpenForm = newFills.findLast(
      (fill) =>
        fill.objectMetadataId === openValidationRuleForm.objectMetadataId &&
        fill.validationRuleId ===
          (openValidationRuleForm.validationRuleId ?? null),
    );

    if (isDefined(fillForOpenForm)) {
      store.set(validationRuleFormFillState.atom, fillForOpenForm);
    }
  };

  return { processValidationRuleFormFills };
};
