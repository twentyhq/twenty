import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button, Radio } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledOption = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledFooter = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[3]};
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
        <StyledOption>
          <Radio
            value="user"
            checked={scope === 'user'}
            onCheckedChange={(checked) => checked && setScope('user')}
            label={t`Just for me`}
          />
        </StyledOption>
        <StyledOption>
          <Radio
            value="workspace"
            checked={scope === 'workspace'}
            onCheckedChange={(checked) => checked && setScope('workspace')}
            label={t`Workspace shared`}
          />
        </StyledOption>
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
