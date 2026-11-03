import { useMutation, useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import {
  BillingPartnerCodeDocument,
  SetBillingPartnerCodeDocument,
} from '~/generated-metadata/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};
  width: 100%;
`;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.xs};
`;

type SettingsBillingPartnerCodeFormProps = {
  instanceId: string;
};

export const SettingsBillingPartnerCodeForm = ({
  instanceId,
}: SettingsBillingPartnerCodeFormProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const { data } = useQuery(BillingPartnerCodeDocument);
  const [setBillingPartnerCode, { loading }] = useMutation(
    SetBillingPartnerCodeDocument,
    { refetchQueries: [BillingPartnerCodeDocument] },
  );

  const [draftPartnerCode, setDraftPartnerCode] = useState<string | null>(null);

  if (!isDefined(data)) {
    return null;
  }

  const { partnerCode, isEditable } = data.billingPartnerCode;
  const savedPartnerCode = partnerCode?.toUpperCase() ?? '';
  const displayedPartnerCode = draftPartnerCode ?? savedPartnerCode;
  const trimmedPartnerCode = displayedPartnerCode.trim();

  const canApply = isEditable && !loading && trimmedPartnerCode !== '';

  const lockedHint = isDefined(partnerCode)
    ? t`Your workspace is linked to this partner. Contact support to change it.`
    : t`A partner code can no longer be added after the first payment. Contact support to add one.`;

  const handleApply = async () => {
    if (!canApply) {
      return;
    }

    try {
      await setBillingPartnerCode({
        variables: { partnerCode: trimmedPartnerCode },
      });
      setDraftPartnerCode(null);
      enqueueToast({ status: 'success', children: t`Partner code applied` });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return (
    <StyledContainer>
      <StyledRow>
        <SettingsTextInput
          instanceId={instanceId}
          label={t`Partner code`}
          placeholder={t`Optional`}
          value={displayedPartnerCode}
          onChange={setDraftPartnerCode}
          onInputEnter={handleApply}
          disabled={!isEditable}
        />
        {isEditable && (
          <Button
            variant="outline"
            onClick={handleApply}
            disabled={!canApply}
            loading={loading}
          >{t`Apply`}</Button>
        )}
      </StyledRow>
      <StyledHint>
        {isEditable ? t`Once applied, the code cannot be changed.` : lockedHint}
      </StyledHint>
    </StyledContainer>
  );
};
