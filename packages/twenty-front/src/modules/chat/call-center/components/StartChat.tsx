import { START_CHAT_MODAL_ID } from '@/chat/call-center/constants/StartChatModalId';
import { CallCenterContext } from '@/chat/call-center/context/CallCenterContext';
import { CallCenterContextType } from '@/chat/call-center/types/CallCenterContextType';
import { FormPhoneFieldInput } from '@/object-record/record-field/form-types/components/FormPhoneFieldInput';
import { FormSelectFieldInput } from '@/object-record/record-field/form-types/components/FormSelectFieldInput';
import { FieldPhonesValue } from '@/object-record/record-field/types/FieldMetadata';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

import styled from '@emotion/styled';
import { AnimatePresence, LayoutGroup } from 'framer-motion';
import { useContext, useEffect, useMemo, useState } from 'react';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section, SectionAlignment, SectionFontColor } from 'twenty-ui/layout';

type StartChatProps = {
  isStartChatOpen: boolean;
  setIsStartChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPhoneUpdate: (phoneNumber: string | null) => void;
  onIntegrationUpdate: (integrationId: string | null) => void;
};

const StyledInitChatModal = styled(Modal)`
  border-radius: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(6)};
  width: calc(400px - ${({ theme }) => theme.spacing(32)});
`;

const StyledCenteredButton = styled(Button)`
  justify-content: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCenteredTitle = styled.div`
  text-align: center;
`;

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

export const StartChat = ({
  isStartChatOpen,
  setIsStartChatOpen,
  onPhoneUpdate,
  onIntegrationUpdate,
}: StartChatProps) => {
  // const { t } = useTranslation();

  const { openModal } = useModal();

  const { activeWhatsappIntegrations } = useContext(
    CallCenterContext,
  ) as CallCenterContextType;

  const [phone, setPhone] = useState<string>('');
  const [integrationId, setIntegrationId] = useState<string>('');
  const [isPhoneValid, setIsPhoneValid] = useState<boolean>(false);

  // const waIntegration = activeWhatsappIntegrations.map((integration) => ({
  //   label: integration.label,
  //   value: integration.id,
  // }));

  const waIntegration = useMemo(() => {
    return activeWhatsappIntegrations.map((integration) => ({
      label: integration.name,
      value: integration.id,
    }));
  }, [activeWhatsappIntegrations]);

  useEffect(() => {
    if (waIntegration.length === 1) {
      setIntegrationId(waIntegration[0].value);
    }
  }, [waIntegration]);

  const handlePhoneChange = (value: FieldPhonesValue) => {
    setPhone((prevPhone) => {
      const callingCode =
        value.primaryPhoneCallingCode || prevPhone.slice(0, 2) || '';

      const fullPhone = `${callingCode}${value.primaryPhoneNumber}`;

      return fullPhone;
    });

    setIsPhoneValid(value.primaryPhoneNumber.length >= 5);
  };

  const handleBusinessIdChange = (value: string | null) => {
    setIntegrationId(value ?? '');
  };

  const handleConfirm = () => {
    if (phone.length >= 5) {
      onPhoneUpdate(phone);
      onIntegrationUpdate(integrationId);
    } else {
      onPhoneUpdate(null);
      onIntegrationUpdate(null);
    }

    setIsStartChatOpen(false);
  };

  const handleCancel = () => {
    setPhone('');
    setIntegrationId('');
    onPhoneUpdate(null);
    onIntegrationUpdate(null);

    setIsStartChatOpen(false);
  };

  openModal(START_CHAT_MODAL_ID);

  return (
    <AnimatePresence mode="wait">
      <LayoutGroup>
        {isStartChatOpen && (
          <StyledInitChatModal
            modalId={START_CHAT_MODAL_ID}
            isClosable
            onClose={handleCancel}
          >
            <StyledCenteredTitle>
              <H1Title
                title={'Start Conversation'}
                fontColor={H1TitleFontColor.Primary}
              />
            </StyledCenteredTitle>
            <StyledSection
              alignment={SectionAlignment.Center}
              fontColor={SectionFontColor.Primary}
            >
              {
                'This will start a conversation with a template, enter the number below'
              }
            </StyledSection>
            <StyledSection>
              <FormSelectFieldInput
                label="Inbox"
                defaultValue={integrationId}
                options={waIntegration}
                onChange={handleBusinessIdChange}
              />
              <FormPhoneFieldInput onChange={handlePhoneChange} />
            </StyledSection>
            <StyledCenteredButton
              onClick={handleConfirm}
              variant="primary"
              accent="blue"
              title={'Start conversation'}
              disabled={!isPhoneValid}
              fullWidth
              dataTestId="init-chat-modal-confirm-button"
            />
            <StyledCenteredButton
              onClick={handleCancel}
              variant="secondary"
              title={'Cancel'}
              fullWidth
            />
          </StyledInitChatModal>
        )}
      </LayoutGroup>
    </AnimatePresence>
  );
};
