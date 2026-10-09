import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { IconListCheck } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { AiChatAskStatusRow } from '@/ai/components/AiChatAskStatusRow';
import { StyledAiChatAskStatusDetail } from '@/ai/components/AiChatAskStyledComponents';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { validationRuleFormFillState } from '@/validation-rules/states/validationRuleFormFillState';
import { type ValidationRuleFormFill } from '@/validation-rules/types/ValidationRuleFormFill';
import { getValidationRuleBrowsingContext } from '@/validation-rules/utils/getValidationRuleBrowsingContext';

const StyledApplyButtonContainer = styled.div`
  display: flex;
`;

type AiChatValidationRuleFormFillCardProps = {
  validationRuleFormFill: ValidationRuleFormFill;
};

export const AiChatValidationRuleFormFillCard = ({
  validationRuleFormFill,
}: AiChatValidationRuleFormFillCardProps) => {
  const { t } = useLingui();
  const { pathname } = useLocation();
  const { objectMetadataItems } = useObjectMetadataItems();
  const setValidationRuleFormFill = useSetAtomState(
    validationRuleFormFillState,
  );

  const openValidationRuleForm = getValidationRuleBrowsingContext({
    pathname,
    objectMetadataItems,
  });
  const isFormOpen =
    isDefined(openValidationRuleForm) &&
    openValidationRuleForm.objectMetadataId ===
      validationRuleFormFill.objectMetadataId &&
    (openValidationRuleForm.validationRuleId ?? null) ===
      validationRuleFormFill.validationRuleId;

  const ruleName = validationRuleFormFill.name;

  return (
    <AiChatAskStatusRow
      Icon={IconListCheck}
      message={t`Rule ready: ${ruleName}`}
      isShimmering={false}
    >
      <StyledAiChatAskStatusDetail>
        {validationRuleFormFill.expression}
      </StyledAiChatAskStatusDetail>
      {isFormOpen ? (
        <StyledApplyButtonContainer>
          <Button
            size="sm"
            onClick={() => setValidationRuleFormFill(validationRuleFormFill)}
          >{t`Apply to form`}</Button>
        </StyledApplyButtonContainer>
      ) : (
        <StyledAiChatAskStatusDetail>
          {t`Open the rule page to apply it.`}
        </StyledAiChatAskStatusDetail>
      )}
    </AiChatAskStatusRow>
  );
};
