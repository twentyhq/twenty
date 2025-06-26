import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useLazyFindOneRecord } from '@/object-record/hooks/useLazyFindOneRecord';
import { FormBooleanFieldInput } from '@/object-record/record-field/form-types/components/FormBooleanFieldInput';
import { FormRelationToOneFieldInput } from '@/object-record/record-field/form-types/components/FormRelationToOneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/form-types/components/FormTextFieldInput';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { AdditionalrecipientsFormItem } from '@/signature/components/AdditionalRecipientsFormItem';
import {
  StyledDescription,
  StyledTitle,
} from '@/signature/components/SharedStyledComponents';
import { getSignatureColor } from '@/signature/constants/signatureColors';
import { SignatureFieldType } from '@/signature/constants/signatureFieldTypes';
import { useCreateSignature } from '@/signature/hooks/useCreateSignature';
import { AppPath } from '@/types/AppPath';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import styled from '@emotion/styled';
import { useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCalendar,
  IconCheckbox,
  IconLetterCaseUpper,
  IconPlus,
  IconSignature,
  IconTextScan2,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { User } from '~/generated/graphql';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

export enum SignatureCreationStep {
  CONFIGURATION = 'configuration',
  SIGNATURE = 'signature',
}

type CreateSignatureFormItemsProps = {
  onNext: (step: SignatureCreationStep) => void;
  currentStep: SignatureCreationStep;
  currentPageIndex: number;
  currentUser: User;
  attachment: ObjectRecord;
};

const StyledForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledSigneeContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledOrderSelect = styled.div`
  width: 100px;
`;

const StyledBooleanFieldContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledDeleteSigneeButton = styled(IconButton)`
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledColorCircle = styled.div<{ color: string }>`
  background-color: ${({ color }) => color};
  border-radius: 50%;
  height: 16px;
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 16px;
`;

export const CreateSignatureFormItems = ({
  onNext,
  currentStep,
  currentPageIndex,
  currentUser,
  attachment,
}: CreateSignatureFormItemsProps) => {
  const { watch, setValue, handleSubmit } =
    useFormContext<CreateSignatureFormValues>();
  const { findOneRecord } = useLazyFindOneRecord({
    objectNameSingular: 'person',
  });
  const { createSignature, loading } = useCreateSignature();
  const { enqueueSnackBar } = useSnackBar();
  const navigateApp = useNavigateApp();

  const orderEnabled = watch('order_enabled');
  const signees = watch('signees');
  const userSignatureEnabled = watch('user_signature');
  const signatures = watch('signatures') || [];
  const additionalReceiverIds = watch('additional_receiver_ids') || [];
  const selectedSigneeId = watch('selected_signee_id');

  const addSignee = (e: React.MouseEvent) => {
    e.preventDefault();
    const newSigneeIndex = signees.length;
    setValue('signees', [
      ...signees,
      { id: null, color: getSignatureColor(newSigneeIndex) },
    ]);
  };

  const handleSigneeSelection = async (
    personId: string | null,
    signeeIndex: number,
  ) => {
    const actualIndex = userSignatureEnabled ? signeeIndex + 1 : signeeIndex;

    if (!personId) {
      const newSignees = [...signees];
      newSignees[actualIndex] = {
        ...newSignees[actualIndex],
        id: null,
        name: undefined,
        email: undefined,
      };
      setValue('signees', newSignees);
      return;
    }

    await findOneRecord({
      objectRecordId: personId,
      onCompleted: (person) => {
        if (!person) {
          throw new Error('Person not found');
        }

        const newSignees = [...signees];
        newSignees[actualIndex] = {
          ...newSignees[actualIndex],
          id: personId,
          color: getSignatureColor(actualIndex),
          name: `${person.name?.firstName} ${person.name?.lastName}`,
          email: person.emails?.primaryEmail,
        };
        setValue('signees', newSignees);
      },
    });
  };

  const removeSignee = (signeeId: string | null) => {
    if (signees.length > 1) {
      const signeeToRemove = signees.find((signee) => signee.id === signeeId);
      if (!signeeToRemove) return;
      const newSignees = signees
        .filter((signee) => signee.id !== signeeId)
        .map((signee, index) => ({
          ...signee,
          color: getSignatureColor(index),
        }));
      setValue('signees', newSignees);

      // Remove all signatures associated with the removed signee
      if (isDefined(signeeToRemove.id)) {
        const currentSignatures = signatures.filter(
          (signature) => signature.signee_id !== signeeToRemove.id,
        );
        setValue('signatures', currentSignatures);
      }
    }
  };

  const getSignatureBoxSize = (fieldType: SignatureFieldType) => {
    switch (fieldType) {
      case SignatureFieldType.SIGNATURE:
        return { width: 80, height: 15 };
      case SignatureFieldType.INITIALS:
        return { width: 30, height: 15 };
      case SignatureFieldType.TEXT:
        return { width: 80, height: 15 };
      case SignatureFieldType.DATE:
        return { width: 80, height: 15 };
      case SignatureFieldType.CHECKBOX:
        return { width: 15, height: 15 };
      default:
        return { width: 80, height: 15 };
    }
  };

  const getInitialsName = (fullName: string) => {
    if (!fullName) return '';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[parts.length - 1][0]}.`;
  };

  const addSignature = (fieldType: SignatureFieldType) => {
    if (!selectedSigneeId) return;

    const selectedSignee = signees.find(
      (signee) => signee.id === selectedSigneeId,
    );
    if (!selectedSignee) return;

    const { width, height } = getSignatureBoxSize(fieldType);
    const initialsName = getInitialsName(selectedSignee.name ?? '');

    // Generate a unique index for the new signature
    const maxIndex =
      signatures.length > 0 ? Math.max(...signatures.map((s) => s.index)) : -1;

    const newSignature = {
      name: initialsName,
      email: selectedSignee.email ?? '',
      x: 50, // Default position from left
      y: 50, // Default position from top
      width,
      height,
      page_index: currentPageIndex,
      field_type: fieldType,
      signee_id: selectedSigneeId,
      index: maxIndex + 1,
    };

    setValue('signatures', [...signatures, newSignature]);
  };

  const getExcludedPersonIds = (): string[] => {
    const signeeIds = signees.map((signee) => signee.id).filter(isDefined);
    return [...signeeIds, ...additionalReceiverIds].filter(
      (id) => id.length > 0,
    );
  };

  const addCurrentUserAsSignee = () => {
    const currentUserAlreadyExists = signees.find(
      (signee) => signee.id === currentUser.id,
    );
    if (isDefined(currentUserAlreadyExists)) {
      return;
    }
    setValue('signees', [
      {
        id: currentUser.id,
        color: getSignatureColor(0),
        name: `(You) ${currentUser.firstName} ${currentUser.lastName}`,
        email: currentUser.email,
      },
      ...signees.map((signee, index) => ({
        ...signee,
        color: getSignatureColor(index + 1),
      })),
    ]);
  };

  const signeesExcludingCurrentUser = signees.filter(
    (signee) => signee.id !== currentUser.id,
  );

  const onSubmit = async (formValues: CreateSignatureFormValues) => {
    try {
      await createSignature({
        title: formValues.title,
        message: formValues.message,
        signees: formValues.signees,
        user_signature: formValues.user_signature,
        order_enabled: formValues.order_enabled,
        additional_receiver_ids: formValues.additional_receiver_ids,
        additional_receiver_emails: formValues.additional_receiver_emails,
        file_name: attachment.fullPath,
        attachment_id: attachment.id,
        signatures: formValues.signatures,
      });

      enqueueSnackBar('Signature created successfully', {
        variant: SnackBarVariant.Success,
      });
      if (isDefined(attachment.personId)) {
        navigateApp(
          AppPath.RecordShowPage,
          {
            objectNameSingular: CoreObjectNameSingular.Person,
            objectRecordId: attachment.personId,
          },
          undefined,
          undefined,
          'files',
        );
      } else {
        navigateApp(AppPath.RecordIndexPage, {
          objectNamePlural: CoreObjectNamePlural.Person,
        });
      }
    } catch (error) {
      enqueueSnackBar('Failed to create signature', {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <StyledForm>
      {currentStep === SignatureCreationStep.CONFIGURATION && (
        <>
          <FormTextFieldInput
            label="Title"
            defaultValue=""
            placeholder="Enter Signature Request Title"
            onChange={(value) => setValue('title', value)}
          />

          <FormTextFieldInput
            label="Message"
            defaultValue=""
            placeholder="Enter Signature Request Message"
            onChange={(value) => setValue('message', value)}
            multiline
          />

          <StyledBooleanFieldContainer>
            <FormBooleanFieldInput
              label="I will sign the document"
              defaultValue={userSignatureEnabled}
              onChange={(value) => {
                setValue('user_signature', Boolean(value));
                if (value === true) {
                  addCurrentUserAsSignee();
                } else {
                  removeSignee(currentUser.id);
                }
              }}
            />

            <FormBooleanFieldInput
              label="Enable signing order"
              defaultValue={orderEnabled}
              onChange={(value) => {
                setValue('order_enabled', Boolean(value));
                if (value === true) {
                  const newSignees = signees.map((signee, index) => ({
                    ...signee,
                    order: index + 1,
                  }));
                  setValue('signees', newSignees);
                  return;
                }
                setValue(
                  'signees',
                  signees.map((signee, index) => ({
                    ...signee,
                    color: getSignatureColor(index),
                  })),
                );
              }}
            />
          </StyledBooleanFieldContainer>

          <StyledTitle>Signees</StyledTitle>
          <StyledDescription>
            Add signees to the document. They will be able to sign the document.
          </StyledDescription>

          {signeesExcludingCurrentUser.map((field, index) => (
            <StyledSigneeContainer key={index}>
              <FormRelationToOneFieldInput
                label="Signee"
                objectNameSingular="person"
                defaultValue={field.id}
                onChange={(value) => {
                  const personId = value as string | null;
                  handleSigneeSelection(personId, index);
                }}
                excludedRecordIds={getExcludedPersonIds()}
              />
              {orderEnabled && (
                <StyledOrderSelect>
                  <FormSelectFieldInput
                    label="Order"
                    defaultValue={(userSignatureEnabled
                      ? index + 2
                      : index + 1
                    ).toString()}
                    onChange={(value) => {
                      const newSignees = [...signees];
                      newSignees[index] = {
                        ...newSignees[index],
                        order: parseInt(value as string),
                      };
                      setValue('signees', newSignees);
                    }}
                    options={Array.from(
                      { length: signeesExcludingCurrentUser.length },
                      (_, i) => ({
                        label: `${userSignatureEnabled ? i + 2 : i + 1}`,
                        value: `${userSignatureEnabled ? i + 2 : i + 1}`,
                      }),
                    )}
                  />
                </StyledOrderSelect>
              )}
              {index > 0 && (
                <StyledDeleteSigneeButton
                  Icon={IconX}
                  onClick={() => removeSignee(field.id)}
                  variant="tertiary"
                  size="small"
                />
              )}
            </StyledSigneeContainer>
          ))}

          <Button Icon={IconPlus} title="Add Signee" onClick={addSignee} />

          <AdditionalrecipientsFormItem />
        </>
      )}
      {currentStep === SignatureCreationStep.SIGNATURE && (
        <>
          <FormSelectFieldInput
            label="Select Signee"
            defaultValue={selectedSigneeId}
            onChange={(value) => {
              if (isDefined(value)) {
                setValue('selected_signee_id', value);
              }
            }}
            options={signees
              .filter((signee) => signee.id !== null)
              .map((signee) => {
                return {
                  label: signee.name ?? '',
                  value: signee.id as string,
                  Icon: () => <StyledColorCircle color={signee.color} />,
                };
              })}
          />
          <Button
            Icon={IconSignature}
            title="Add Signature"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.SIGNATURE)}
          />
          <Button
            Icon={IconLetterCaseUpper}
            title="Add Initials"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.INITIALS)}
          />
          <Button
            Icon={IconCalendar}
            title="Add Date"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.DATE)}
          />
          <Button
            Icon={IconTextScan2}
            title="Add Text"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.TEXT)}
          />
          <Button
            Icon={IconCheckbox}
            title="Add Checkbox"
            variant="primary"
            onClick={() => addSignature(SignatureFieldType.CHECKBOX)}
          />
        </>
      )}
      <StyledButtonContainer>
        {currentStep === SignatureCreationStep.CONFIGURATION && (
          <Button
            title="Next"
            variant="secondary"
            onClick={() => {
              if (isDefined(signees[0].id)) {
                setValue('selected_signee_id', signees[0].id);
                onNext(SignatureCreationStep.SIGNATURE);
              }
            }}
          />
        )}
        {currentStep === SignatureCreationStep.SIGNATURE && (
          <StyledBooleanFieldContainer>
            <Button
              title="Previous"
              variant="secondary"
              onClick={() => onNext(SignatureCreationStep.CONFIGURATION)}
            />
            <Button
              title={loading ? 'Creating...' : 'Submit'}
              variant="primary"
              accent="green"
              onClick={handleSubmit(onSubmit)}
              disabled={loading}
            />
          </StyledBooleanFieldContainer>
        )}
      </StyledButtonContainer>
    </StyledForm>
  );
};
