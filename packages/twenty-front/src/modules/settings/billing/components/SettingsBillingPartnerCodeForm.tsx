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

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  width: 100%;
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

  const [draftPartnerCode, setDraftPartnerCode] = useState<string | null>(
    null,
  );

  if (!isDefined(data)) {
    return null;
  }

  const { partnerCode, isEditable } = data.billingPartnerCode;
  const savedPartnerCode = partnerCode?.toUpperCase() ?? '';
  const displayedPartnerCode = draftPartnerCode ?? savedPartnerCode;
  const trimmedPartnerCode = displayedPartnerCode.trim();

  const canApply =
    isEditable &&
    !loading &&
    trimmedPartnerCode !== '' &&
    trimmedPartnerCode.toLowerCase() !== partnerCode;

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
    <StyledRow>
      <SettingsTextInput
        instanceId={instanceId}
        label={t`Partner code`}
        placeholder={t`Optional`}
        value={displayedPartnerCode}
        onChange={setDraftPartnerCode}
        onInputEnter={handleApply}
        disabled={!isEditable}
        hint={
          isEditable
            ? undefined
            : t`The partner code is locked after the first payment. Contact support to change it.`
        }
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
  );
};
