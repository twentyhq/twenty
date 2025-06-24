import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { useFetchPeople } from '@/people/types/hooks/useFetchPeople';
import {
  StyledDeleteSigneeButton,
  StyledDescription,
  StyledSigneeContainer,
  StyledTitle,
} from '@/signature/components/SharedStyledComponents';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

export const AdditionalrecipientsFormItem = () => {
  const { people: additionalrecipients, fetchPeople } = useFetchPeople();
  const { setValue, watch } = useFormContext<CreateSignatureFormValues>();
  const additionalrecipientIds = watch('additional_receiver_ids');
  const signees = watch('signees');

  const addAdditionalrecipient = (e: React.MouseEvent) => {
    e.preventDefault();
    setValue('additional_receiver_ids', [...additionalrecipientIds, '']);
  };

  const removeAdditionalrecipient = (index: number) => {
    const newAdditionalrecipientIds = [...additionalrecipientIds];
    newAdditionalrecipientIds.splice(index, 1);
    setValue('additional_receiver_ids', newAdditionalrecipientIds);
  };

  const getExcludedPersonIds = (): string[] => {
    const signeeIds = signees.map((signee) => signee.id).filter(isDefined);
    return [...signeeIds, ...additionalrecipientIds].filter(
      (id) => id.length > 0,
    );
  };

  useEffect(() => {
    setValue(
      'additional_receiver_emails',
      additionalrecipients.map((person) => person.emails?.primaryEmail ?? ''),
    );
  }, [additionalrecipients, setValue]);

  return (
    <>
      <StyledTitle>Additional Recipients</StyledTitle>
      <StyledDescription>
        Send finished documents to these recipients (they won't need to sign)
      </StyledDescription>
      {additionalrecipientIds.map((recipientId, index) => (
        <StyledSigneeContainer key={index}>
          <FormRelationToOneFieldInput
            label="Additional recipient"
            objectNameSingular="person"
            defaultValue={recipientId}
            onChange={(value) => {
              const personId = value as string;
              const updatedAdditionalrecipientIds = [...additionalrecipientIds];
              updatedAdditionalrecipientIds[index] = personId;
              setValue(
                'additional_receiver_ids',
                updatedAdditionalrecipientIds,
              );
              fetchPeople(updatedAdditionalrecipientIds);
            }}
            excludedRecordIds={getExcludedPersonIds()}
          />

          <StyledDeleteSigneeButton
            Icon={IconX}
            onClick={() => removeAdditionalrecipient(index)}
            variant="tertiary"
            size="small"
          />
        </StyledSigneeContainer>
      ))}
      <Button
        Icon={IconPlus}
        title="Add Additional recipient"
        onClick={addAdditionalrecipient}
      />
    </>
  );
};
