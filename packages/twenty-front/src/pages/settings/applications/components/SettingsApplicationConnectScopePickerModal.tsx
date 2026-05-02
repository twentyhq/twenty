import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { ModalStatefulWrapper } from '@/ui/layout/modal/components/ModalStatefulWrapper';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

  const options = [
    {
      value: 'user',
      title: t`Just for me`,
      description: t`Only you can use this credential. Use this for personal accounts.`,
    },
    {
      value: 'workspace',
      title: t`Workspace shared`,
      description: t`Anyone in this workspace can use this credential. Pick this for shared bots or service accounts.`,
    },
  ];

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
        <SettingsRadioCardContainer
          value={scope}
          options={options}
          onChange={(value) => setScope(value as 'user' | 'workspace')}
        />
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
          onClick={() => {
            closeModal(modalInstanceId);
            onConfirm(scope);
          }}
        />
      </StyledFooter>
    </ModalStatefulWrapper>
  );
};
