import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { SettingsRadioCardContainer } from '@/settings/components/SettingsRadioCardContainer';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H1Title, H1TitleFontColor } from 'twenty-ui/display';
import { SectionAlignment, SectionFontColor } from 'twenty-ui/layout';
import {
  StyledAppModal,
  StyledAppModalButton,
  StyledAppModalSection,
  StyledAppModalTitle,
} from '~/pages/settings/applications/components/SettingsAppModalLayout';

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
      description: t`Only you can use this credential.`,
    },
    {
      value: 'workspace',
      title: t`Workspace shared`,
      description: t`Anyone in this workspace can use this credential.`,
    },
  ];

  return (
    <StyledAppModal modalId={modalInstanceId} isClosable padding="large">
      <StyledAppModalTitle>
        <H1Title
          title={t`Connect ${providerDisplayName}`}
          fontColor={H1TitleFontColor.Primary}
        />
      </StyledAppModalTitle>
      <StyledAppModalSection
        alignment={SectionAlignment.Center}
        fontColor={SectionFontColor.Primary}
      >
        <SettingsRadioCardContainer
          value={scope}
          options={options}
          onChange={(value) => setScope(value as 'user' | 'workspace')}
        />
      </StyledAppModalSection>
      <StyledAppModalButton
        onClick={() => closeModal(modalInstanceId)}
        variant="secondary"
        title={t`Cancel`}
        fullWidth
        justify="center"
      />
      <StyledAppModalButton
        onClick={() => {
          closeModal(modalInstanceId);
          onConfirm(scope);
        }}
        variant="secondary"
        accent="blue"
        title={t`Continue`}
        fullWidth
        justify="center"
      />
    </StyledAppModal>
  );
};
