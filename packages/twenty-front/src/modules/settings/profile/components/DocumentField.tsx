import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useDebouncedCallback } from 'use-debounce';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { PERSON_TYPE_OPTIONS } from '@/settings/constants/PersonTypeOptions';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { formatCnpj } from '~/utils/formatCnpj';
import { formatCpf } from '~/utils/formatCpf';
import isCnpj from '~/utils/isCnpj';
import { logError } from '~/utils/logError';
import { validateCnpj } from '~/utils/validateCnpj';
import { validateCpf } from '~/utils/validateCpf';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type DocumentFieldProps = {
  autoSave?: boolean;
  onDocumentUpdate?: (document: string) => void;
};

export const DocumentField = ({
  autoSave = true,
  onDocumentUpdate,
}: DocumentFieldProps) => {
  const currentUser = useRecoilValue(currentUserState);
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );

  const [document, setDocument] = useState(
    isCnpj(currentWorkspaceMember?.userDocument)
      ? formatCnpj(currentWorkspaceMember?.userDocument || '')
      : formatCpf(currentWorkspaceMember?.userDocument || ''),
  );

  const [personType, setPersonType] = useState(
    isCnpj(currentWorkspaceMember?.userDocument) ? 'CNPJ' : 'CPF',
  );

  const [error, setError] = useState<string | undefined>(undefined);
  const [disabled, setDisabled] = useState(true);

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  const debouncedUpdate = useDebouncedCallback(async () => {
    onDocumentUpdate?.(document);

    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      if (autoSave) {
        await updateOneRecord({
          idToUpdate: currentWorkspaceMember?.id,
          updateOneRecordInput: {
            userDocument: document.replace(/\D/g, ''),
          },
        });

        setCurrentWorkspaceMember({
          ...currentWorkspaceMember,
          userDocument: document.replace(/\D/g, ''),
        });
      }
    } catch (error) {
      logError(error);
    }
  }, 500);

  useEffect(() => {
    if (!currentWorkspaceMember) {
      return;
    }

    setDisabled(
      currentWorkspaceMember?.userDocument?.length === 14 ||
        currentWorkspaceMember?.userDocument?.length === 11,
    );

    if (!(validateCnpj(document) || validateCpf(document))) {
      setError('Invalid Document');
      return;
    }

    const currentUserDocument = currentWorkspaceMember.userDocument;

    if (
      currentUserDocument !== document.replace(/\D/g, '') &&
      document !== ''
    ) {
      setError(undefined);
      debouncedUpdate();
    }

    return () => {
      debouncedUpdate.cancel();
    };
  }, [
    document,
    currentUser,
    debouncedUpdate,
    autoSave,
    currentWorkspaceMember,
  ]);

  return (
    <StyledComboInputContainer>
      <FormSelectFieldInput
        label="Person type"
        defaultValue={personType}
        onChange={(value) => setPersonType(value ?? 'CPF')}
        options={PERSON_TYPE_OPTIONS}
        readonly={disabled}
      />
      <TextInputV2
        label="Document"
        value={document}
        onChange={(text) => {
          personType === 'CNPJ'
            ? setDocument(formatCnpj(text))
            : setDocument(formatCpf(text));
        }}
        placeholder={
          personType === 'CNPJ' ? '99.999.999/9999-99' : '999.999.999-99'
        }
        error={error}
        fullWidth
        disabled={disabled}
      />
    </StyledComboInputContainer>
  );
};
