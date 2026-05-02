import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button, Radio } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledOption = styled.label`
  align-items: flex-start;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledOptionText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledOptionTitle = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledOptionDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[4]};
`;

type SettingsApplicationConnectScopePickerModalProps = {
  modalInstanceId: string;
  providerDisplayName: string;
  onConfirm: (scope: 'user' | 'workspace') => void;
};

export const SettingsApplicationConnectScopePickerModal = ({
  modalInstanceId,
  providerDisplayName,
  onConfirm,
}: SettingsApplicationConnectScopePickerModalProps) => {
  const { t } = useLingui();
  const { closeModal } = useModal();
  const [scope, setScope] = useState<'user' | 'workspace'>('user');

  const handleContinue = () => {
    closeModal(modalInstanceId);
    onConfirm(scope);
  };

  return (
    <ModalStatefulWrapper
      modalInstanceId={modalInstanceId}
      isClosable
      padding="large"
      overlay="dark"
      renderInDocumentBody
      smallBorderRadius
      narrowWidth
      autoHeight
    >
      <H1Title
        title={t`Connect ${providerDisplayName}`}
        fontColor={H1TitleFontColor.Primary}
      />
      <Section>
        <StyledOptions>
          <StyledOption>
            <Radio
              value="user"
              checked={scope === 'user'}
              onCheckedChange={(checked) => checked && setScope('user')}
            />
            <StyledOptionText>
              <StyledOptionTitle>{t`Just for me`}</StyledOptionTitle>
              <StyledOptionDescription>
                {t`Only you can use this credential. Use this for personal accounts.`}
              </StyledOptionDescription>
            </StyledOptionText>
          </StyledOption>
          <StyledOption>
            <Radio
              value="workspace"
              checked={scope === 'workspace'}
              onCheckedChange={(checked) => checked && setScope('workspace')}
            />
            <StyledOptionText>
              <StyledOptionTitle>{t`Workspace shared`}</StyledOptionTitle>
              <StyledOptionDescription>
                {t`Anyone in this workspace can use this credential. Pick this for shared bots or service accounts.`}
              </StyledOptionDescription>
            </StyledOptionText>
          </StyledOption>
        </StyledOptions>
      </Section>
      <StyledFooter>
        <Button
          variant="secondary"
          title={t`Cancel`}
          onClick={() => closeModal(modalInstanceId)}
        />
        <Button
          variant="primary"
          accent="blue"
          title={t`Continue`}
          onClick={handleContinue}
        />
      </StyledFooter>
    </ModalStatefulWrapper>
  );
};
