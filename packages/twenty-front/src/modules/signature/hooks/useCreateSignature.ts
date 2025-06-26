import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { gql, useMutation } from '@apollo/client';
import { useRecoilValue } from 'recoil';
import { CreateSignatureFormValues } from '~/pages/SignaturePage/SignaturePage';

const CREATE_RABBIT_SIGN_SIGNATURE_WITH_EXTERNAL = gql`
  mutation CreateRabbitSignSignatureWithExternalCall(
    $input: CreateOneRabbitSignSignatureInput!
  ) {
    createRabbitSignSignatureWithExternalCall(input: $input) {
      id
    }
  }
`;

export const useCreateSignature = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const [createSignatureMutation, { loading, error }] = useMutation(
    CREATE_RABBIT_SIGN_SIGNATURE_WITH_EXTERNAL,
  );

  const createSignature = async (formValues: CreateSignatureFormValues) => {
    if (!currentWorkspaceMember) {
      throw new Error('No current workspace member found');
    }

    // Convert signatures to JSON string for the DTO
    const signaturesJson = JSON.stringify(formValues.signatures || []);

    const result = await createSignatureMutation({
      variables: {
        input: {
          title: formValues.title,
          message: formValues.message,
          signatureStatus: 'PROCESSING',
          workspaceMemberId: currentWorkspaceMember.id,
          filename: formValues.file_name,
          attachmentId: formValues.attachment_id,
          signaturesData: signaturesJson,
        },
      },
    });

    return result.data.createRabbitSignSignatureWithExternalCall;
  };

  return {
    createSignature,
    loading,
    error,
  };
};
